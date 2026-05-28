# Claude Has a Token Budget. So Should Your API.

*Every engineer who has built a public-facing API has lived this nightmare: your system is humming along fine at 9 AM, and by 10 AM you're staring at a cascade of 500s because someone's script is hammering your endpoints 10,000 times a minute. Rate limiting is the unglamorous, under-appreciated layer that keeps that nightmare from becoming your Monday morning.*

*But here's the thing — most developers treat rate limiting as an afterthought, a line in an Nginx config or a third-party plugin they slap on at the last minute. Once you understand the algorithms underneath, it stops feeling like a configuration detail and starts feeling like a design decision that shapes the character of your entire system.*

---

## The Claude Problem — And Why It's Yours Too

If you've used Claude's API, you've already encountered rate limiting designed thoughtfully. Anthropic gives each API tier a token budget — a rolling allowance of input + output tokens per minute. Hit the ceiling and you get a `429 Too Many Requests` with a `Retry-After` header telling you exactly when your budget resets. Burn through tokens slowly and the budget quietly replenishes. Idle for a while and it fills back up to the cap.

That behaviour — burst tolerance, graceful rejection, self-healing recovery signal — is the Token Bucket algorithm in production. And Anthropic isn't unique here; Stripe, AWS, and OpenAI all manage their APIs the same way.

That tension — between honouring legitimate high-frequency users and protecting infrastructure from abuse or accidental overload — is precisely what rate limiting algorithms are designed to navigate. And as with most engineering tradeoffs, there is no single right answer. There are five major strategies, each with a different personality, and choosing the right one depends on how your traffic behaves.

Let's walk through all five.

---

## 1. The Leaky Bucket — The Orderly Queue

Imagine a government ration shop. People arrive at all hours, but the counter serves exactly one customer every few minutes regardless of how long the queue gets. That is the leaky bucket.

```
Incoming requests (any rate)
         │
         ▼
   ┌───────────┐
   │  Queue    │  ← Fixed capacity (e.g. 5)
   │  [■][■][ ]│
   └─────┬─────┘
         │ drains at fixed rate (e.g. 2 req/sec)
         ▼
    Processed
```

Requests flow into a queue at whatever rate they arrive. The system drains the queue at a fixed, steady rate. If the queue fills up, the overflow is dropped.

**The strength:** perfectly smooth output. No matter how chaotic the input, downstream services see a predictable, even flow.

**The weakness:** it has no memory of quiet periods. If your queue was empty for the past 10 seconds, you don't get any credit for that tranquility — the next burst still gets throttled the moment the queue depth is exceeded. It is ideal for network bandwidth management and video streaming pipelines where jitter is the enemy.

---

## 2. Token Bucket — The Claude Token Budget

This one is closest to how most APIs you use daily actually work (Stripe, AWS EC2, Anthropic, and most public APIs use this model).

You've seen it if you've ever hit Claude's API limits. Each tier gets a token budget — say 100,000 tokens per minute. The system refills it continuously at a fixed rate. Every request consumes tokens proportional to input + output length. If your balance hits zero, you get a 429. But if you've been sending small, infrequent requests, your budget quietly fills back up to the cap. Come back after a few idle minutes and you have a full tank again.

```
                refill: +1 token/sec
                      │
                      ▼
              ┌───────────────┐
              │  ● ● ●        │  capacity = 5
              │  tokens       │  current  = 3
              └───────┬───────┘
                      │ -1 per request
                      ▼
               Request allowed ✓
```

The key difference from the leaky bucket is **burst tolerance**. If you have 5 tokens saved up, you can fire 5 requests instantly. That makes it perfect for user-facing APIs where occasional spikes are legitimate behaviour — a mobile app re-syncing after coming back online, a developer running a batch job after hours of idling.

**The tradeoff:** tuning `capacity` and `refillRate` requires real understanding of your traffic patterns. Too generous and you're not protecting much; too tight and you frustrate legitimate power users.

Here's the core implementation:

```java
synchronized boolean isAllowed() {
    refill();
    if (tokens == 0) return false;
    tokens--;
    return true;
}

private void refill() {
    long now = System.currentTimeMillis();
    long elapsedSeconds = (now - lastRefillTime) / 1000;
    int tokensToAdd = (int) (elapsedSeconds * refillRatePerSecond); // cast AFTER multiply!
    if (tokensToAdd > 0) {
        tokens = Math.min(capacity, tokens + tokensToAdd);
        lastRefillTime = now;
    }
}
```

One subtle bug worth calling out: `(int)elapsedSeconds * refillRatePerSecond` truncates the long to int *before* multiplying, silently losing precision on longer intervals. Always cast after.

---

## 3. Fixed Window Counter — The Census Approach

Like how India counts population in census blocks — everything within a defined period is counted together, and the slate resets at the boundary.

Divide time into fixed windows (1 second, 1 minute, etc.). Count requests in each window. Exceed the threshold? Rejected. Window resets? Counter zeros out.

```
|── Window 1 (0–60s) ──|── Window 2 (60–120s) ──|
  2 req at t=10s ✓
  3 req at t=30s ✓  (total=5, at limit)
  2 req at t=40s ✗  (would make 7)
                          1 req at t=61s ✓  (fresh window)
```

Simple. Cheap. Easy to reason about.

**The boundary problem:** Imagine your limit is 5 requests/minute. A user sends 5 requests at t=59s (end of window 1) and 5 more at t=61s (start of window 2). Both batches pass individually. But in the two-second span around the boundary, 10 requests went through — double your limit. The algorithm saw two compliant windows; reality saw a burst.

This is fine for steady traffic. It's a problem when users are adversarial or traffic is bursty at predictable intervals.

---

## 4. Sliding Window Log — The Cricket Scorebook

A cricket scorer doesn't just count runs per over in isolation — they track every ball's timestamp and can tell you exactly how many runs were scored in any arbitrary rolling 5-over window. That granularity is the sliding window log.

Every accepted request gets its timestamp logged. When a new request arrives, the system purges entries older than the window size, then checks if the remaining log length is within the limit.

```
Window = 1 second, Limit = 3

t=0.0s  log=[0.0]           → ✓  (size 1)
t=0.3s  log=[0.0, 0.3]      → ✓  (size 2)
t=0.6s  log=[0.0, 0.3, 0.6] → ✓  (size 3)
t=0.9s  log=[0.0, 0.3, 0.6] → ✗  (size 3, no room)
t=1.1s  evict 0.0 → log=[0.3, 0.6], add 1.1 → ✓  (size 3)
```

The implementation stores a `Deque<Long>` of timestamps per user:

```java
synchronized boolean isAllowed() {
    long now = System.currentTimeMillis();
    long cutoff = now - windowSizeMillis;

    // Evict timestamps outside the window
    while (!log.isEmpty() && log.peekFirst() <= cutoff) {
        log.pollFirst();
    }

    if (log.size() >= limit) return false;

    log.addLast(now);
    return true;
}
```

**The strength:** zero approximation. Perfectly accurate, no boundary artifacts.

**The cost:** O(limit) memory per user. At 100 requests/minute per user across 10 million users, that's a billion timestamps in memory. It is the most precise algorithm and the least scalable one. Use it when limits are small and accuracy is non-negotiable.

---

## 5. Sliding Window Counter — The Engineering Compromise

This is where the pragmatic system designer lives. It captures most of the accuracy of the log approach with the memory efficiency of the counter approach.

Instead of logging every timestamp, it keeps two numbers: the count from the previous window and the count from the current window. When a new request arrives, it calculates a weighted estimate of how many requests have effectively happened in the last `windowSize`:

```
estimate = (previousCount × (1 − elapsed/windowSize)) + currentCount
```

A concrete example with limit = 3, window = 5 seconds:

```
Previous window: 3 requests
Current window start: now

At t = 1s into current window (20% elapsed):
  weight of previous = 1 - 0.20 = 0.80
  estimate = 3 × 0.80 + 0 = 2.4
  2.4 + 1 = 3.4 → EXCEEDS limit of 3 → ✗ Rejected

At t = 2s into current window (40% elapsed):
  weight of previous = 1 - 0.40 = 0.60
  estimate = 3 × 0.60 + 0 = 1.8
  1.8 + 1 = 2.8 → within limit → ✓ Accepted
```

The previous window's influence fades linearly as the current window progresses. It is an approximation — the real count could be slightly different — but in practice the error is small and the memory cost is constant.

```java
synchronized boolean isAllowed() {
    long now = System.currentTimeMillis();
    long elapsed = now - currentWindowStart;

    if (elapsed >= windowSizeMillis) {
        previousCount = (elapsed < 2 * windowSizeMillis) ? currentCount : 0;
        currentCount = 0;
        currentWindowStart = now;
        elapsed = 0;
    }

    double weight = 1.0 - (double) elapsed / windowSizeMillis;
    double estimate = previousCount * weight + currentCount;

    if (estimate + 1 > limit) return false;

    currentCount++;
    return true;
}
```

---

## The High-Level Picture

When you're building a production rate limiter, the algorithm choice is only one part of the story. The bigger architectural question is: **where does state live?**

Each request check needs to know how many requests this user has made recently. In a single-server setup, that's trivial — keep it in memory. In a distributed system with dozens of API gateway instances, each gateway needs to see the same shared counter.

```
                    ┌──────────────────┐
User Request ──────▶│   API Gateway    │
                    │  (Rate Limiter)  │
                    └────────┬─────────┘
                             │ get/set counter
                             ▼
                    ┌──────────────────┐
                    │  Redis Cluster   │  ← shared state
                    │  (per-user keys) │
                    └──────────────────┘
```

Redis is the standard answer here — fast, atomic operations, built-in key expiry. A single `INCR` command is atomic; use Lua scripts for read-then-write operations to avoid race conditions.

For rule configuration (which users get which limits), a push-based config service is far better than polling a database. When a rule changes, the change is pushed over a persistent connection to all gateways and they update in memory instantly — no polling delay, no extra latency on every request check.

---

## The Response Contract

One thing that often gets skipped: when you do rate limit someone, *tell them how to recover*. A bare `429 Too Many Requests` is rude. The better practice is to send headers that give the client a roadmap:

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1718600460
Retry-After: 30
```

`Retry-After` in particular is the mark of a well-designed API. It turns a frustrating rejection into a self-healing interaction — the client knows exactly when to try again, without guessing or exponential backoff from scratch.

---

## Choosing Your Algorithm

| Algorithm | Memory | Accuracy | Burst Tolerance | Best For |
|---|---|---|---|---|
| Leaky Bucket | O(queue size) | Smooth output | None | Streaming, bandwidth |
| Token Bucket | O(1) | Exact | Yes, up to capacity | Public APIs, user-facing |
| Fixed Window Counter | O(1) | Approximate (boundary issue) | Within window | Login attempt limits |
| Sliding Window Log | O(limit) | Exact | No | Low-limit, high-precision |
| Sliding Window Counter | O(1) | ~Approximate | Smoothed | High-scale APIs |

For most public APIs with real-world traffic: **Token Bucket** if bursts are expected and fine; **Sliding Window Counter** if you want smoothed enforcement with minimal memory footprint.

---

Rate limiting is one of those topics where the surface looks simple — *just count requests* — but the depth reveals real tradeoffs between precision, memory, fairness, and scale. The five algorithms above aren't just interview prep material; they are the actual decision space you'll navigate when your API starts getting real traffic.

Design it intentionally. Your on-call rotation will thank you.

---

*Full working Java implementation of all five algorithms (with concurrency-safe designs and inline comments) is linked below.*

---

---

## LinkedIn Post

🤖 Claude's API has a token budget that refills continuously, handles burst requests gracefully, and tells you exactly when to retry. That's not magic — it's the Token Bucket algorithm running in production.

I just published a deep dive into all 5 rate limiting algorithms (Token Bucket, Leaky Bucket, Fixed Window, Sliding Window Log & Counter) — with working Java code, real tradeoffs, and Claude's own token management as the opening example.

If you've ever wondered why Anthropic, Stripe, and AWS all converged on the same approach, this one explains it 👇

#SystemDesign #BackendEngineering #APIDesign

---

## Medium Tags

`System Design` · `Backend Development` · `API Design` · `Java` · `Software Architecture` · `Distributed Systems` · `Engineering`

---

## Medium Headline

**Claude Has a Token Budget. So Should Your API — A Deep Dive Into the 5 Rate Limiting Algorithms Every Backend Engineer Should Know**