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
        node.next = head.next;
        node.next.prev = node;
        head.next = node;
        node.prev = head;
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
