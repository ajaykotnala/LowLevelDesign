# Concurrency

Concurrency is about multiple tasks running at the same time. Three categories of problems arise: keeping state **correct**, **coordinating** between producers and consumers, and managing **scarce** shared resources.

---

## Categories of Problems

| # | Category | Core Question |
|---|----------|---------------|
| 1 | [Correctness](#1-correctness) | How do we prevent two threads from corrupting shared state? |
| 2 | [Coordination](#2-coordination) | How do threads work alongside each other safely? |
| 3 | [Scarcity](#3-scarcity) | How do we respect limits on a shared resource? |

---

## 1. Correctness

**Problem:** Two threads modifying shared state at the same time can produce incorrect results.

> Example: Two users booking the same seat simultaneously — both see it as available and both book it.

### Pattern A — Check-then-act (Lock)

Use a **lock** to ensure only one thread checks and acts at a time. Without a lock, two threads can both see the resource as free and both proceed.

```java
synchronized (this) {
    if (seatAvailable) {
        bookSeat(); // only one thread enters at a time
    }
}
```

### Pattern B — Read-modify-write (Atomic Integer)

Use an **atomic integer** for counters. The CPU guarantees the read, increment, and write happen as one indivisible hardware operation — no lock needed.

```java
AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet(); // thread-safe, no lock required
```

---

## 2. Coordination

**Problem:** A producer generates work and a consumer processes it — how do they stay in sync?

> Example: A user logs in → trigger a confirmation email.

```
Producer  →  Queue  →  Consumer
```

### Problem A — How does the consumer know work has arrived?

**Solution: Blocking Queue**

The consumer blocks (sleeps) when the queue is empty and wakes up automatically when the producer adds work. No busy-waiting.

```java
BlockingQueue<Task> queue = new LinkedBlockingQueue<>();

// Producer
queue.put(newTask);

// Consumer
Task task = queue.take(); // blocks until work is available
process(task);
```

### Problem B — What if work arrives too fast?

**Solution: Bounded Blocking Queue**

Cap the queue at a fixed size (e.g. 100). The producer blocks when the queue is full, naturally throttling the system into batches the consumer can keep up with.

```java
BlockingQueue<Task> queue = new LinkedBlockingQueue<>(100); // bounded at 100

queue.put(task); // blocks if queue is full — backpressure applied automatically
```

---

## 3. Scarcity

**Problem:** A shared resource can only handle a limited number of concurrent users.

> Example: A third-party API that allows at most 25 concurrent calls.

**Solution: Semaphore**

A semaphore holds a fixed number of permits (e.g. 25). Each thread must acquire a permit before using the resource and release it when done — enforcing the concurrency limit automatically.

```
acquire permit  →  do the work  →  release permit
```

### ⚠️ Always release in a `finally` block

If `doWork()` throws an exception, the permit is never released and the semaphore leaks — eventually no permits remain and all threads block forever.

```java
Semaphore permit = new Semaphore(25);

while (true) {
    permit.acquire();
    try {
        doWork(); // call the third-party API
    } catch (Exception e) {
        throw e;
    } finally {
        permit.release(); // always runs, even on exception
    }
}
```

---

## Summary

| Problem | Pattern | Key Mechanism |
|---------|---------|---------------|
| Correctness -  Two threads booking the same seat | Lock / Atomic Integer | Mutual exclusion or hardware atomicity |
| Coordination - Consumer missing new work | Blocking Queue | Consumer sleeps and wakes on arrival |
| Coordination - Producer overwhelming consumer | Bounded Blocking Queue | Queue cap applies backpressure |
| Scarcity - Too many API calls at once | Semaphore | Permit pool limits concurrency |