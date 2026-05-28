---

Uber Burned Its Entire AI Budget in 4 Months. Here's the System Design Problem Nobody Is Talking About
The token bill always comes due. The only question is whether you designed it.
API Rate Limiting - what, why, how?
Github | LinkedIn | WHOmI

---

Two Stories, One Root Cause
1. How Uber's Leaderboard Became a Token Furnace
In December 2025, Uber rolled out Anthropic's Claude Code to roughly 5,000 engineers. By April 2026 - four months later - the company had exhausted its entire annual budget for AI coding tools. Uber's CTO said the company is now "back to the drawing board."
Around the same time, a developer on Reddit woke up to an email they'll never forget. They had set up a Claude Code automation script to check for software updates every 30 minutes in a loop. They went to sleep. The script did not. By morning it had generated a $6,000 bill - roughly the price of a decent used motorcycle - from a single overnight session.
2. The Claude Problem - And Why It's Yours Too
If you've used Claude's API, you've already encountered rate limiting designed thoughtfully. Anthropic gives each API tier a token budget - a rolling allowance of input + output tokens per minute. Hit the ceiling, and you get a 429 Too Many Requests Retry-After header telling you exactly when your budget resets. Burn through tokens slowly, and the budget quietly replenishes. Idle for a while, and it fills back up to the cap.
That behaviour - burst tolerance, graceful rejection, self-healing recovery signal - is the Token Bucket algorithm in production. And Anthropic isn't unique here; Stripe, AWS, and OpenAI all manage their APIs the same way.
Now consider what happens when that token bucket meets 5,000 engineers with no spending counter in sight. Uber introduced Claude Code to its engineers in December 2025. By April 2026, the company had exhausted its entire annual budget for AI coding tools. The culprit wasn't rogue usage - it was incentivised usage. Inside Uber, engineers were ranked on leaderboards by how much they used the tool. The more tokens consumed, the higher the score, which gave engineers every reason to use Claude Code aggressively and no reason to hold back. Monthly AI-related spending per engineer ranged between $150 and $250 on average, while heavy users spent between $500 and $2,000. Uber's CTO said the company is now "back to the drawing board."
The lesson here isn't that token-based pricing is broken. It's that unconstrained consumption at scale is always a system design problem - whether you're Anthropic protecting your inference infrastructure or an enterprise protecting its engineering budget. Rate limiting is the mechanism that keeps both sides sane.
That tension - between honouring legitimate high-frequency users and protecting infrastructure from abuse or accidental overload - is precisely what rate limiting algorithms are designed to navigate. And as with most engineering tradeoffs, there is no single right answer. There are five major strategies, each with a different personality, and choosing the right one depends on how your traffic behaves.
Let's walk through all five.

---

1. 
The Leaky Bucket - The Orderly Queue(FIFO)
Imagine a government ration shop. People arrive at all hours, but the counter serves exactly one customer every few minutes regardless of how long the queue gets. That is the leaky bucket.
Requests flow into a queue at whatever rate they arrive. The system drains the queue at a fixed, steady rate. If the queue fills up, the overflow is dropped.

---

2. 
Token Bucket - The Claude Token Budget
This one is closest to how most APIs you use daily actually work (Stripe, AWS EC2, Anthropic, and most public APIs use this model).
You've seen it if you've ever hit Claude's API limits. Each tier gets a token budget - say 100,000 tokens per minute. The system refills it continuously at a fixed rate. Every request consumes tokens proportional to input + output length. If your balance hits zero, you get a 429. But if you've been sending small, infrequent requests, your budget quietly fills back up to the cap. Come back after a few idle minutes and you have a full tank again.
The key difference from the leaky bucket is burst tolerance. If you have 5 tokens saved up, you can fire 5 requests instantly. That makes it perfect for user-facing APIs where occasional spikes are legitimate behaviour - a mobile app re-syncing after coming back online, a developer running a batch job after hours of idling.
The tradeoff: tuning capacity and refillRate requires real understanding of your traffic patterns. Too generous and you're not protecting much; too tight and you frustrate legitimate power users.
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
One subtle bug worth calling out: (int)elapsedSeconds * refillRatePerSecond truncates the long to int before multiplying, silently losing precision on longer intervals. Always cast after.

---

3. 
Fixed Window Counter - The Census Approach
Like how India counts population in census blocks - everything within a defined period is counted together, and the slate resets at the boundary.
Divide time into fixed windows (1 second, 1 minute, etc.). Count requests in each window. Exceed the threshold? Rejected. Window resets? Counter zeros out.
Simple. Cheap. Easy to reason about.
The boundary problem: Imagine your limit is 5 requests/minute. A user sends 5 requests at t=59s (end of window 1) and 5 more at t=61s (start of window 2). Both batches pass individually. But in the two-second span around the boundary, 10 requests went through - double your limit. The algorithm saw two compliant windows; reality saw a burst.
This is fine for steady traffic. It's a problem when users are adversarial or when traffic is bursty at predictable intervals.

---

4. 
Sliding Window Log - The Cricket Scorebook
A cricket scorer doesn't just count runs per over in isolation - they track every ball's timestamp and can tell you exactly how many runs were scored in any arbitrary rolling 5-over window. That granularity is the sliding window log.
Every accepted request gets its timestamp logged. When a new request arrives, the system purges entries older than the window size, then checks if the remaining log length is within the limit.
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
The strength: zero approximation. Perfectly accurate, no boundary artifacts.
The cost: O(limit) memory per user. At 100 requests/minute per user across 10 million users, that's a billion timestamps in memory. It is the most precise algorithm and the least scalable one. Use it when limits are small and accuracy is non-negotiable.

---

5. 
Sliding Window Counter - The Engineering Compromise
This is where the pragmatic system designer lives. It captures most of the accuracy of the log approach with the memory efficiency of the counter approach.
Instead of logging every timestamp, it keeps two numbers: the count from the previous window and the count from the current window. When a new request arrives, it calculates a weighted estimate of how many requests have effectively happened in the last windowSize:
estimate = (previousCount × (1 − elapsed/windowSize)) + currentCount
The previous window's influence fades linearly as the current window progresses. It is an approximation - the real count could be slightly different - but in practice the error is small and the memory cost is constant.
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

---

The High-Level Picture - API Rate Limit System Design
When you're building a production rate limiter, the algorithm choice is only one part of the story. The bigger architectural question is: where does the state live?
Each request check needs to know how many requests this user has made recently. In a single-server setup, that's trivial - keep it in memory. In a distributed system with dozens of API gateway instances, each gateway needs to see the same shared counter.
System Design API Ratelimit
Redis is the standard answer here - fast, atomic operations, built-in key expiry. A single INCR command is atomic; use Lua scripts for read-then-write operations to avoid race conditions.
For rule configuration (which users get which limits), a push-based config service is far better than polling a database. When a rule changes, the change is pushed over a persistent connection to all gateways and they update in memory instantly - no polling delay, no extra latency on every request check.
The Response Contract
One thing that often gets skipped: when you do rate limit someone, tell them how to recover. A bare 429 Too Many Requestsis rude. The better practice is to send headers that give the client a roadmap:
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1718600460
Retry-After: 30
Retry-After in particular is the mark of a well-designed API. It turns a frustrating rejection into a self-healing interaction - the client knows exactly when to try again, without guessing or exponential backoff from scratch.
Full Code
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

// ─── Domain ───────────────────────────────────────────────────────────────────

class Request {
    private final String userId;
    private final long ip;

    public Request(String userId, long ip) {
        this.userId = userId;
        this.ip = ip;
    }

    public String getUserId() { return userId; }
    public long getIp()       { return ip; }
}

// ─── Strategy Interface ───────────────────────────────────────────────────────

interface RateLimitingStrategy {
    boolean isAllowed(Request request);
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. TOKEN BUCKET
// ─────────────────────────────────────────────────────────────────────────────
// Idea : Each user owns a bucket that holds up to `capacity` tokens.
//        One token is consumed per request. The bucket refills at a fixed
//        rate (tokens/second). Bursts are allowed up to `capacity`.
//
//  Timeline example  (capacity=3, refill=1 t/s, requests every 500 ms):
//
//   t=0.0s  req→ tokens: 3→2  ✓
//   t=0.5s  req→ tokens: 2→1  ✓
//   t=1.0s  refill +1 → tokens: 2→2, then 2→1  ✓
//   t=1.5s  req→ tokens: 1→0  ✓
//   t=2.0s  refill +1 → tokens: 1  then 1→0  ✓
//   t=2.5s  req→ tokens: 0  ✗  429
// ═════════════════════════════════════════════════════════════════════════════

class TokenBucket {
    private final int capacity;
    private final int refillRatePerSecond;
    private int tokens;
    private long lastRefillTime;

    public TokenBucket(int capacity, int refillRatePerSecond) {
        this.capacity = capacity;
        this.refillRatePerSecond = refillRatePerSecond;
        this.tokens = capacity;
        this.lastRefillTime = System.currentTimeMillis();
    }

    synchronized boolean isAllowed() {
        refill();
        if (tokens == 0) return false;
        tokens--;
        return true;
    }

    private void refill() {
        long now = System.currentTimeMillis();
        long elapsedSeconds = (now - lastRefillTime) / 1000;
        int tokensToAdd = (int) (elapsedSeconds * refillRatePerSecond); // cast AFTER multiply
        if (tokensToAdd > 0) {
            tokens = Math.min(capacity, tokens + tokensToAdd);
            lastRefillTime = now;
        }
    }
}

class TokenBucketStrategy implements RateLimitingStrategy {
    private final Map<String, TokenBucket> bucketRepository = new ConcurrentHashMap<>();
    private final int capacity;
    private final int refillRatePerSecond;

    public TokenBucketStrategy(int capacity, int refillRatePerSecond) {
        this.capacity = capacity;
        this.refillRatePerSecond = refillRatePerSecond;
    }

    @Override
    public boolean isAllowed(Request request) {
        TokenBucket bucket = bucketRepository.computeIfAbsent(
            request.getUserId(),
            id -> new TokenBucket(capacity, refillRatePerSecond)
        );
        return bucket.isAllowed();
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. SLIDING WINDOW COUNTER
// ─────────────────────────────────────────────────────────────────────────────
// Idea : Divide time into fixed windows (e.g. 1 s). Keep a counter for the
//        current window and the previous one. Estimate the count inside a
//        "virtual" sliding window using a weighted sum:
//
//   count = prevCount × (1 − elapsed/windowSize) + currCount
//
//  This avoids the burst-at-boundary problem of a plain fixed window.
//
//  Timeline example  (limit=3, window=1 s, requests every 300 ms):
//
//   Window [0–1s]
//     t=0.0s  count=1  ✓
//     t=0.3s  count=2  ✓
//     t=0.6s  count=3  ✓
//     t=0.9s  count=4  ✗  429   ← limit hit inside same window
//
//   Window rolls at t=1.0s  (prev=3, curr resets)
//     t=1.0s  elapsed=0 → estimate = 3×1.0 + 0 = 3 → adding 1 = 4  ✗ 429
//     t=1.2s  elapsed=0.2 → estimate = 3×0.8 + 0 = 2.4 → adding 1 ≈ 3  ✓
// ═════════════════════════════════════════════════════════════════════════════

class SlidingWindowCounter {
    private final int limit;
    private final long windowSizeMillis;

    private long currentWindowStart;
    private int currentCount;
    private int previousCount;

    public SlidingWindowCounter(int limit, long windowSizeMillis) {
        this.limit = limit;
        this.windowSizeMillis = windowSizeMillis;
        this.currentWindowStart = System.currentTimeMillis();
        this.currentCount = 0;
        this.previousCount = 0;
    }

    synchronized boolean isAllowed() {
        long now = System.currentTimeMillis();
        long elapsed = now - currentWindowStart;

        // Slide the window forward if needed
        if (elapsed >= windowSizeMillis) {
            previousCount = (elapsed < 2 * windowSizeMillis) ? currentCount : 0;
            currentCount = 0;
            currentWindowStart = now;
            elapsed = 0;
        }

        // Weight: fraction of the previous window still "inside" the sliding window
        double weight = 1.0 - (double) elapsed / windowSizeMillis;
        double estimate = previousCount * weight + currentCount;

        if (estimate + 1 > limit) return false;

        currentCount++;
        return true;
    }
}

class SlidingWindowCounterStrategy implements RateLimitingStrategy {
    private final Map<String, SlidingWindowCounter> counterRepository = new ConcurrentHashMap<>();
    private final int limit;
    private final long windowSizeMillis;

    public SlidingWindowCounterStrategy(int limit, long windowSizeMillis) {
        this.limit = limit;
        this.windowSizeMillis = windowSizeMillis;
    }

    @Override
    public boolean isAllowed(Request request) {
        SlidingWindowCounter counter = counterRepository.computeIfAbsent(
            request.getUserId(),
            id -> new SlidingWindowCounter(limit, windowSizeMillis)
        );
        return counter.isAllowed();
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. SLIDING WINDOW LOG
// ─────────────────────────────────────────────────────────────────────────────
// Idea : Store the exact timestamp of every request inside a sliding window.
//        On each new request, evict timestamps older than `windowSize`, then
//        check if the remaining log size is below `limit`.
//
//  More accurate than the counter approach (no weighting approximation) but
//  uses O(limit) memory per user.
//
//  Timeline example  (limit=3, window=1 s, requests every 300 ms):
//
//   t=0.0s  log=[0.0]          size=1  ✓
//   t=0.3s  log=[0.0, 0.3]     size=2  ✓
//   t=0.6s  log=[0.0, 0.3, 0.6] size=3  ✓
//   t=0.9s  log=[0.0,0.3,0.6]  size=3 → reject  ✗  429
//   t=1.1s  evict 0.0 → log=[0.3,0.6], add 1.1 → size=3  ✓
//   t=1.4s  evict 0.3 → log=[0.6,1.1], add 1.4 → size=3  ✓
// ═════════════════════════════════════════════════════════════════════════════

class SlidingWindowLog {
    private final int limit;
    private final long windowSizeMillis;
    private final Deque<Long> log = new ArrayDeque<>(); // stores timestamps (ms)

    public SlidingWindowLog(int limit, long windowSizeMillis) {
        this.limit = limit;
        this.windowSizeMillis = windowSizeMillis;
    }

    synchronized boolean isAllowed() {
        long now = System.currentTimeMillis();
        long cutoff = now - windowSizeMillis;

        // Evict timestamps outside the sliding window
        while (!log.isEmpty() && log.peekFirst() <= cutoff) {
            log.pollFirst();
        }

        if (log.size() >= limit) return false;

        log.addLast(now);
        return true;
    }
}

class SlidingWindowLogStrategy implements RateLimitingStrategy {
    private final Map<String, SlidingWindowLog> logRepository = new ConcurrentHashMap<>();
    private final int limit;
    private final long windowSizeMillis;

    public SlidingWindowLogStrategy(int limit, long windowSizeMillis) {
        this.limit = limit;
        this.windowSizeMillis = windowSizeMillis;
    }

    @Override
    public boolean isAllowed(Request request) {
        SlidingWindowLog windowLog = logRepository.computeIfAbsent(
            request.getUserId(),
            id -> new SlidingWindowLog(limit, windowSizeMillis)
        );
        return windowLog.isAllowed();
    }
}

// ─── Rate Limiting Service ────────────────────────────────────────────────────

class RateLimitingService {
    private final RateLimitingStrategy strategy;

    public RateLimitingService(RateLimitingStrategy strategy) {
        this.strategy = strategy;
    }

    void submitRequest(Request request) {
        if (strategy.isAllowed(request)) {
            System.out.println("✓ Request accepted  [" + request.getUserId() + "]");
        } else {
            System.out.println("✗ 429 – Rate limited [" + request.getUserId() + "]");
        }
    }
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

public class APIRateLimitter {
    public static void main(String[] args) throws InterruptedException {

        System.out.println("═══ Token Bucket  (capacity=3, refill=1 t/s) ════════════════");
        RateLimitingService tokenBucketService = new RateLimitingService(
            new TokenBucketStrategy(3, 1)
        );
        sendRequests(tokenBucketService, "user_1", 10, 300);

        System.out.println("\n═══ Sliding Window Counter  (limit=3, window=1 s) ═══════════");
        RateLimitingService counterService = new RateLimitingService(
            new SlidingWindowCounterStrategy(3, 1000)
        );
        sendRequests(counterService, "user_2", 10, 300);

        System.out.println("\n═══ Sliding Window Log  (limit=3, window=1 s) ════════════════");
        RateLimitingService logService = new RateLimitingService(
            new SlidingWindowLogStrategy(3, 1000)
        );
        sendRequests(logService, "user_3", 10, 300);
    }

    private static void sendRequests(RateLimitingService service,
                                     String userId, int count, long delayMs)
            throws InterruptedException {
        for (int i = 1; i <= count; i++) {
            service.submitRequest(new Request(userId, i));
            Thread.sleep(delayMs);
        }
    }
}

---

Choosing Your Algorithm
For most public APIs with real-world traffic: Token Bucket if bursts are expected and fine; Sliding Window Counter if you want smoothed enforcement with minimal memory footprint.

---

Rate limiting is one of those topics where the surface looks simple - just count requests - but the depth reveals real tradeoffs between precision, memory, fairness, and scale. The five algorithms above aren't just interview prep material; they are the actual decision space you'll navigate when your API starts getting real traffic.
Design it intentionally. Your on-call rotation will thank you.
Code Repo: https://github.com/ajaykotnala/LowLevelDesign/tree/main/LLDs/APIRateLimit
System Design · Backend Development · API Design · Java · Software Architecture · Distributed Systems · Engineering
