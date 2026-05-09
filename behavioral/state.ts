// State Design Pattern Example: Traffic Light System
// The State design pattern is a behavioral design pattern that allows an object to alter its behavior when its internal state changes. 
// In this pattern, the object's behavior is encapsulated in separate state classes, and the object can change its state at runtime. 
// This pattern promotes loose coupling and allows for dynamic behavior changes based on the object's state.

// Let's build a simple example of a Document state system.
// The Document can be in three states: Draft, Moderation, and Published. 
// Each state will have different behaviors for the document, such as editing, submitting for review, and publishing.
// now we will define the State interface and then create concrete state classes for each state of the document.

// Define the State interface

interface DocumentLifecycleState {
    draft(documentContext: DocumentContext): void;
    submitForReview(documentContext: DocumentContext): void;
    publish(documentContext: DocumentContext): void;
}

// Context class
class DocumentContext {
    private state: DocumentLifecycleState;

    constructor() {
        this.state = new DraftState(); // Initial state is Draft
    }

    setState(state: DocumentLifecycleState): void {
        this.state = state;
    }

    draft(): void {
        this.state.draft(this);
    }

    submitForReview(): void {
        this.state.submitForReview(this);
    }

    publish(): void {
        this.state.publish(this);
    }
}

// Concrete State classes
class DraftState implements DocumentLifecycleState {
    draft(documentContext: DocumentContext): void {
        console.log("Document is already in Draft state.");
    }
    submitForReview(documentContext: DocumentContext): void {
        console.log("Submitting document for review...");
        documentContext.setState(new ModerationState());
    }
    publish(documentContext: DocumentContext): void {
        console.log("Cannot publish a document in Draft state. Please submit for review first.");
    }
}

class ModerationState implements DocumentLifecycleState {
    draft(documentContext: DocumentContext): void {
        console.log("Cannot edit a document in Moderation state. Please wait for review to complete.");
    }
    submitForReview(documentContext: DocumentContext): void {
        console.log("Document is already submitted for review.");
    }
    publish(documentContext: DocumentContext): void {
        console.log("Publishing document...");
        documentContext.setState(new PublishedState());
    }
}

class PublishedState implements DocumentLifecycleState {
    draft(documentContext: DocumentContext): void {
        console.log("Cannot edit a document in Published state. Please create a new document.");
    }
    submitForReview(documentContext: DocumentContext): void {
        console.log("Cannot submit a document in Published state. Please create a new document.");
    }
    publish(documentContext: DocumentContext): void {
        console.log("Document is already published.");
    }
}


class clientcode {
    main() {
        // Client code to test the Document state system
        const documentContext = new DocumentContext();
        documentContext.draft(); // Document is already in Draft state.
        documentContext.submitForReview(); // Submitting document for review...
        documentContext.publish(); // Publishing document...
        documentContext.draft(); // Cannot edit a document in Published state. Please create a new document.
        documentContext.submitForReview(); // Cannot submit a document in Published state. Please create a new document.
        documentContext.publish(); // Document is already published.
    }
}

new clientcode().main();
export { };

// //Placed → Preparing → OutForDelivery → Delivered

// interface OrderState {
//     orderPlaced(orderId: string): void;
//     preparing(orderId: string): void;
//     outForDelivery(orderId: string): void;
//     delivered(orderId: string): void;
// }

// //get to know about the order state and its transition
// class OrderContext {
//     private currentState: OrderState;
//     constructor() {
//         this.currentState = new OrderPlacedState(this);
//     }

//     //set the next state
//     setState(state: OrderState) {
//         this.currentState = state;
//     }

//     // get the current state of the order 
//     OrderPlaced(orderId: string): void {
//         this.currentState.orderPlaced(orderId);
//        // console.log(`Order ${orderId} is placed.`);
//     }

//     Preparing(orderId: string): void {
//         this.currentState.preparing(orderId);
//        // console.log(`Order ${orderId} is being prepared.`);
//     }

//     OutForDelivery(orderId: string): void {
//         this.currentState.outForDelivery(orderId);
//        // console.log(`Order ${orderId} is out for delivery.`);
//     }

//     Delivered(orderId: string): void {
//         this.currentState.delivered(orderId);
//         //console.log(`Order ${orderId} has been delivered.`);
//     }
// }

// class OrderPlacedState implements OrderState{
//     private orderContext: OrderContext;
//     constructor(orderContext: OrderContext) {
//         this.orderContext = orderContext;
//     }
//     orderPlaced(orderId: string): void {
//         console.log(`Order ${orderId} is already placed.`);
//     }
//     preparing(orderId: string): void {
//         console.log(`Order ${orderId} is being prepared.`);
//         this.orderContext.setState(new PreparingState(this.orderContext));
//     }
//     outForDelivery(orderId: string): void {
//         console.log(`Order ${orderId} cannot be out for delivery. It is still being prepared.`);
//     }
//     delivered(orderId: string): void {
//         console.log(`Order ${orderId} cannot be delivered. It is still being prepared.`);
//     }   
// }

// class PreparingState implements OrderState{
//     private orderContext: OrderContext;
//     constructor(orderContext: OrderContext) {
//         this.orderContext = orderContext;
//     }
//     orderPlaced(orderId: string): void {
//         console.log(`Order ${orderId} is already placed.`);
//     }
//     preparing(orderId: string): void {
//         console.log(`Order ${orderId} is already being prepared.`);
//     }
//     outForDelivery(orderId: string): void {
//         console.log(`Order ${orderId} is out for delivery.`);
//         this.orderContext.setState(new OutForDeliveryState(this.orderContext));
//     }
//     delivered(orderId: string): void {
//         console.log(`Order ${orderId} cannot be delivered. It is still being prepared.`);
//     }       
// }

// class OutForDeliveryState implements OrderState{
//     private orderContext: OrderContext;
//     constructor(orderContext: OrderContext) {
//         this.orderContext = orderContext;
//     }
//     orderPlaced(orderId: string): void {
//         console.log(`Order ${orderId} is already placed.`);
//     }
//     preparing(orderId: string): void {
//         console.log(`Order ${orderId} is already being prepared.`);
//     }
//     outForDelivery(orderId: string): void {
//         console.log(`Order ${orderId} is already out for delivery.`);
//     }
//     delivered(orderId: string): void {
//         console.log(`Order ${orderId} has been delivered.`);
//         this.orderContext.setState(new DeliveredState(this.orderContext));
//     }       
// }

// class DeliveredState implements OrderState{
//     private orderContext: OrderContext;
//     constructor(orderContext: OrderContext) {
//         this.orderContext = orderContext;
//     }
//     orderPlaced(orderId: string): void {
//         console.log(`Order ${orderId} is already placed.`);
//     }
//     preparing(orderId: string): void {
//         console.log(`Order ${orderId} is already being prepared.`);
//     }
//     outForDelivery(orderId: string): void {
//         console.log(`Order ${orderId} is already out for delivery.`);
//     }
//     delivered(orderId: string): void {
//         console.log(`Order ${orderId} has already been delivered.`);
//     }       
// }

// class clientcodeOrder {
//     main() {
//         const orderContext = new OrderContext();
//         const orderId = "Or-12345";
//         orderContext.OrderPlaced(orderId); // Order Or-12345 is placed.
//         orderContext.Preparing(orderId); // Order Or-12345 is being prepared.
//         orderContext.OutForDelivery(orderId); // Order Or-12345 is out for delivery.
//         orderContext.Delivered(orderId); // Order Or-12345 has been delivered.
//     }
// }

// new clientcodeOrder().main();
// export { };