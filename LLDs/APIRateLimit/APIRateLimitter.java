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