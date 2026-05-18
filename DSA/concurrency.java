// Suppose we have a class:

// public class Foo {
//   public void first() { print("first"); }
//   public void second() { print("second"); }
//   public void third() { print("third"); }
// }
// The same instance of Foo will be passed to three different threads. Thread A will call first(), thread B will call second(), and thread C will call third(). Design a mechanism and modify the program to ensure that second() is executed after first(), and third() is executed after second().

// Note:

// We do not know how the threads will be scheduled in the operating system, even though the numbers in the input seem to imply the ordering. The input format you see is mainly to ensure our tests' comprehensiveness.

 

// Example 1:

// Input: nums = [1,2,3]
// Output: "firstsecondthird"
// Explanation: There are three threads being fired asynchronously. The input [1,2,3] means thread A calls first(), thread B calls second(), and thread C calls third(). "firstsecondthird" is the correct output.
// Example 2:

// Input: nums = [1,3,2]
// Output: "firstsecondthird"
// Explanation: The input [1,3,2] means thread A calls first(), thread B calls third(), and thread C calls second(). "firstsecondthird" is the correct output.
 

// Constraints:

// nums is a permutation of [1, 2, 3].

// To ensure that the methods `second()` and `third()` are executed in the correct order after `first()`, we can use synchronization mechanisms such as locks or semaphores. Below is a modified version of the `Foo` class in Java that uses `CountDownLatch` to achieve the desired ordering:

// Import necessary classes
    
// In this implementation:
// - We use two `CountDownLatch` instances: `firstDone` to signal when `first()` is completed, and `secondDone` to signal when `second()` is completed.
// - The `first()` method prints "first" and then calls `countDown()` on `firstDone` to indicate that it has finished.
// - The `second()` method waits for `firstDone` to reach zero (indicating that `first()` has completed) before printing "second" and then calls `countDown()` on `secondDone`.
// - The `third()` method waits for `secondDone` to reach zero (indicating that `second()` has completed) before printing "third".

// This ensures that the methods are executed in the correct order regardless of how the threads are scheduled.    

import java.util.concurrent.CountDownLatch;
public class Foo {
    private CountDownLatch firstDone;
    private CountDownLatch secondDone;
    
    public Foo() {
        firstDone = new CountDownLatch(1);
        secondDone = new CountDownLatch(1);
    }
    
    public void first(Runnable printFirst) throws InterruptedException {
        printFirst.run();
        firstDone.countDown();
    }
    
    public void second(Runnable printSecond) throws InterruptedException {
        firstDone.await();
        printSecond.run();
        secondDone.countDown();
    }
    
    public void third(Runnable printThird) throws InterruptedException {
        secondDone.await();
        printThird.run();
    }
}

