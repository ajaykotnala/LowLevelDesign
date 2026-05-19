import java.util.HashMap;

/*

DLL --> used to maintain the order
HashMap --->
LRUCache
    - put(key, value)
    - get(key)
*/

class Node{
    Node prev;
    int key;
    int value;
    Node next;
    public Node(int key, int value){
        this.key = key;
        this.value = value;
    }
}

//MRU --> head
// LRU --> Tail
// addToHead()
// removeNode()

class DLL{
    Node head;  //dummy node
    Node tail; //dummy node ... 
    public DLL(){
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head.next = tail;   // HEAD ----- LIST ----- TAIL
        tail.prev = head;
    }   

    void addToHead(Node node){
       // node.next = head.next;
        node.next.prev = node;
        head.next = node;

        node.prev = head;
        node.next = tail;
    }

    void removeNode(Node node){
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    void moveToHead(Node node){
        removeNode(node);
        addToHead(node);
    }

    void print(){
        if(head.next == tail)
                return;
        Node temp = head.next;
        System.out.print(" HEAD ");
        while(temp != tail){
            System.out.print("---> " + "[ "+ temp.key +"  " + temp.value +" ]");
            temp = temp.next;
        }
        System.out.println();
    }
}

class LRUCache{
    DLL cache;
    HashMap<Integer,Node> lookup_table;
    int capacity;   //maximum size of lru
    public LRUCache(int capacity){
        this.capacity = capacity;
        lookup_table = new HashMap<>();
        cache = new DLL();
    }
    public void put(int key, int value){
        
        if(lookup_table.containsKey(key)){
            Node curr =  lookup_table.get(key);
            curr.value = value;
            cache.moveToHead(curr);
        }else{
            Node newNode = new Node(key, value);
            lookup_table.put(key, newNode);
            cache.addToHead(newNode);
            // check if you are exceeding the limit

            //1 2 3 
            // 4 1 2 3
            if(lookup_table.size() > capacity){
                // need of remove.
                cache.removeNode(cache.tail.prev);
                lookup_table.remove(key);
            }
        }
        cache.print();
    }
    public int get(int key){
        
        if(lookup_table.containsKey(key)){
            Node curr = lookup_table.get(key);
            cache.moveToHead(curr);
            cache.print();
            return curr.value;
        }else{
            return -1;
        }
    }
}

public class LRU_Cache_demo {
    public static void main(String[] args) {
        LRUCache cache = new LRUCache(3);
        cache.put(1,10);
        cache.put(2,20);
        cache.put(3,100);
        cache.put(4,200);
        // cache.put(2,40);
        System.out.println("GET CALLS");
        cache.get(2);
        // cache.get(2);
    }
}