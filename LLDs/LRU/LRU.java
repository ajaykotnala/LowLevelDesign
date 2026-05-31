import java.util.HashMap;

/*
 * ============================================================
 *  LRU CACHE — How it works
 * ============================================================
 *
 *  We need O(1) get AND O(1) put. To achieve that we combine
 *  two data structures:
 *
 *  1. HashMap<key → Node>
 *     Gives us instant lookup: "does this key exist, and where?"
 *
 *  2. Doubly Linked List (DLL)
 *     Maintains access order.
 *     - Most Recently Used (MRU) lives near the HEAD
 *     - Least Recently Used (LRU) lives near the TAIL
 *
 *  Visual layout:
 *
 *   [HEAD] <--> [most recent] <--> ... <--> [least recent] <--> [TAIL]
 *
 *  HEAD and TAIL are dummy sentinel nodes — they never hold real
 *  data, they just make insert/remove code cleaner (no null checks).
 *
 *  Every time a key is accessed or updated, we move its node to
 *  the front (HEAD side). When we need to evict, we always remove
 *  from the back (TAIL side) — that's the least recently used item.
 * ============================================================
 */


// ── Node ─────────────────────────────────────────────────────
// Each node stores one cache entry and pointers to its neighbors.

class Node {
    int key;
    int value;
    Node prev;
    Node next;

    public Node(int key, int value) {
        this.key   = key;
        this.value = value;
    }
}


// ── Doubly Linked List ────────────────────────────────────────
// Manages ordering. HEAD side = most recent, TAIL side = least recent.
//
//   [HEAD] <──> [A] <──> [B] <──> [C] <──> [TAIL]
//                ↑ MRU              ↑ LRU

class DoublyLinkedList {

    Node head; // dummy — never holds real data
    Node tail; // dummy — never holds real data

    public DoublyLinkedList() {
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head.next = tail;
        tail.prev = head;
        //  HEAD <──> TAIL   (empty list)
    }

    // Insert a node right after HEAD (making it the most recent).
    //
    // Before:  HEAD <──> firstNode
    // After:   HEAD <──> node <──> firstNode
    //
    void addToFront(Node node) {
        Node firstNode = head.next;

        node.prev = head;
        node.next = firstNode;

        head.next      = node;
        firstNode.prev = node;
    }

    // Detach a node from wherever it currently sits in the list.
    //
    // Before:  A <──> node <──> B
    // After:   A <──> B         (node is now disconnected)
    //
    void removeNode(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    // Move an existing node to the front — used on every cache hit.
    void moveToFront(Node node) {
        removeNode(node);
        addToFront(node);
    }

    // The node just before TAIL is always the least recently used.
    Node getLRUNode() {
        return tail.prev;
    }

    // Debug helper — prints the list from MRU → LRU.
    void print() {
        if (head.next == tail) {
            System.out.println("  (cache is empty)");
            return;
        }
        StringBuilder sb = new StringBuilder("  MRU -> ");
        Node current = head.next;
        while (current != tail) {
            sb.append("[").append(current.key).append(":").append(current.value).append("]");
            if (current.next != tail) sb.append(" <-> ");
            current = current.next;
        }
        sb.append(" <- LRU");
        System.out.println(sb);
    }
}


// ── LRU Cache ─────────────────────────────────────────────────
//
//  put(key, value)  →  insert or update a key
//  get(key)         →  fetch a value (-1 if not found)
//
//  Both operations are O(1).

class LRUCache {

    private final int                    capacity;
    private final DoublyLinkedList       list;
    private final HashMap<Integer, Node> map;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.list     = new DoublyLinkedList();
        this.map      = new HashMap<>();
    }

    // ── get ──────────────────────────────────────────────────
    // 1. Key not found → return -1.
    // 2. Key found     → move node to front (it's now most recent)
    //                    and return its value.
    //
    public int get(int key) {
        if (!map.containsKey(key)) {
            return -1;
        }

        Node node = map.get(key);
        list.moveToFront(node); // mark as most recently used
        return node.value;
    }

    // ── put ──────────────────────────────────────────────────
    // Case A — key already exists:
    //   Update the value and move the node to the front.
    //
    // Case B — key is new:
    //   Create a node, add it to the front, register in the map.
    //   If we're now over capacity, evict the LRU node
    //   (the one sitting just before TAIL).
    //
    public void put(int key, int value) {

        if (map.containsKey(key)) {
            // ── Case A: update existing entry ──
            Node node  = map.get(key);
            node.value = value;
            list.moveToFront(node);

        } else {
            // ── Case B: brand-new entry ──
            Node newNode = new Node(key, value);
            map.put(key, newNode);
            list.addToFront(newNode);

            if (map.size() > capacity) {
                evictLRU();
            }
        }
    }

    // Remove the least recently used entry — called when over capacity.
    private void evictLRU() {
        Node lruNode = list.getLRUNode();
        list.removeNode(lruNode);       // remove from the linked list
        map.remove(lruNode.key);        // remove from the map (use lruNode.key, NOT the new key!)
    }

    // Print current cache state.
    public void printCache() {
        list.print();
    }
}


// ── Demo ─────────────────────────────────────────────────────

public class LRUCache {
    public static void main(String[] args) {

        System.out.println("=== LRU Cache (capacity = 3) ===\n");

        LRUCache cache = new LRUCache(3);

        System.out.println("put(1, 10)");
        cache.put(1, 10);
        cache.printCache();

        System.out.println("\nput(2, 20)");
        cache.put(2, 20);
        cache.printCache();

        System.out.println("\nput(3, 30)");
        cache.put(3, 30);
        cache.printCache();

        System.out.println("\nput(4, 40)  ← over capacity, key 1 should be evicted");
        cache.put(4, 40);
        cache.printCache();

        System.out.println("\nget(2)  ← moves key 2 to the front");
        System.out.println("  returned: " + cache.get(2));
        cache.printCache();

        System.out.println("\nput(5, 50)  ← over capacity, key 3 should be evicted (LRU)");
        cache.put(5, 50);
        cache.printCache();

        System.out.println("\nget(1)  ← was evicted earlier, should return -1");
        System.out.println("  returned: " + cache.get(1));
    }
}