class node{
    int data;
    node next;
    node(int data){
        this.data = data;
        this.next = null;
    }
}

class linklist{
    node head;
    linklist(){
        this.head = null;
    }

    void insert(int data){
        if(head == null){
            head = new node(data);
        }else{
            node temp = head;
            node currentnode = new node(data);
            while(temp.next !=null){
                temp = temp.next;
            }
            temp.next = currentnode;
        }
    }

    void printlist(){
        while(head != null){
            System.out.println(head.data);
            head = head.next;
        }
    }
}

class clientdemo {
    public static void main() {
        linklist list = new linklist();
        list.insert(10);
        list.insert(20);
        list.insert(30);
        list.insert(40);
       

        list.printlist();
    }
}   