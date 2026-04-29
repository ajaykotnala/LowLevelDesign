package week5_onwards_interview_ques;

class HashMap {
    private static final int DEFAULT_CAPACITY = 4;
    private static final float LOAD_FACTOR = 0.75f;
    
    private Entry[] table;
    private int size;
    private int capacity;
    
    static class Entry {
        int key;
        int value;
        int hash;
        Entry next;
        
        Entry(int hash, int key, int value, Entry next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }
    
    public HashMap() {
        this.capacity = DEFAULT_CAPACITY;
        this.table = new Entry[capacity];
        this.size = 0;
    }
    
    private int hash(int key) {
        return key % this.capacity; // good hashfunction to 
    }
    

    public void put(int key, int value) {
        if (size >= capacity * LOAD_FACTOR) {
            resize();
        }
        
        int hash = hash(key);
        // int index = getIndex(hash);
        
        Entry entry = table[index];
        while (entry != null) {
            if (entry.hash == hash && entry.key == key) {
                entry.value = value;
                return;
            }
            entry = entry.next;
        }
        
        table[index] = new Entry(hash, key, value, table[index]);
        size++;
    }
    
    public int get(int key) {
        int hash = hash(key);
        int index = getIndex(hash);
        
        Entry entry = table[index];
        while (entry != null) {
            if (entry.hash == hash && entry.key == key) {
                return entry.value;
            }
            entry = entry.next;
        }
        
        return -1;
    }
    
    public void remove(int key) {
        int hash = hash(key);
        int index = getIndex(hash);
        
        Entry entry = table[index];
        Entry prev = null;
        
        while (entry != null) {
            if (entry.hash == hash && entry.key == key) {
                if (prev == null) {
                    table[index] = entry.next;
                } else {
                    prev.next = entry.next;
                }
                size--;
                return;
            }
            prev = entry;
            entry = entry.next;
        }
    }
    
    public boolean containsKey(int key) {
        return get(key) != -1;
    }
    
    public int size() {
        return size;
    }
    
    private void resize() {
        System.out.println("Rehashing");
        Entry[] oldTable = table;
        int oldCapacity = capacity;
        
        capacity *= 2;
        table = new Entry[capacity];
        size = 0;
        
        for (int i = 0; i < oldCapacity; i++) {
            Entry entry = oldTable[i];
            while (entry != null) {
                put(entry.key, entry.value);
                entry = entry.next;
            }
        }
    }
}


public class HashMap_Main{
    public static void main(String[] args) {
        
    }
}