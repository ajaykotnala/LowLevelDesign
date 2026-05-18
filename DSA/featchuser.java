import java.util.*;
import java.util.concurrent.*;

public class ConcurrentFetch {

    // Dummy function — do not change this
    static String fetchUser(int id) throws InterruptedException {
        Thread.sleep(100);
        return "User-" + id;
    }

    public static void main(String[] args) throws Exception {

        int[] ids = {42,7,15,3,99,21,56,8,34,77,
                     11,63,29,84,5,47,92,18,71,38};

        int MAX_CONCURRENT = 5;

        // 1. Thread pool — only 5 threads run at the same time
        ExecutorService pool = Executors.newFixedThreadPool(MAX_CONCURRENT);

        // 2. Submit all 20 tasks, get back a Future for each
        List<Future<String>> futures = new ArrayList<>();
        for (int id : ids) {
            final int capturedId = id;
            futures.add(pool.submit(() -> fetchUser(capturedId)));
        }

        // 3. Collect results IN ORDER (future.get() waits for that task)
        for (int i = 0; i < futures.size(); i++) {
            System.out.println("[" + (i+1) + "] " + futures.get(i).get());
        }

        pool.shutdown();
    }
}