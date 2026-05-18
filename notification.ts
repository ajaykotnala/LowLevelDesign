// Design book my show 

// functional 
// Show 
// time
// users
//

// Assumption from user propestive
// User should be able to see the availablility of shows
// User should be able to block the tickets(Ticket workflow)
// User should be able to make the payment  - payment processor (i will not cover this part in this design)
// User should get notification on timing/booking or any Ticket workflow changes



//non functional
//CAP - Consistent and partition tolerant system.
// Locking mechanism for booking tickets to (optimist locking while booking the tickets (as per platform requirement)
// Extensibility 


//entities

// User
// Show
// Ticket 
// TicketStatus  enun (block, book, cancel)
// Payment (image details or meta data details)
// Notification.

//  DDD 

// Aggregate root is show --  main actor

// show can have many users ---?> users can may one to many tickets --> ticket will have one status at a time.
// ticket --> payment metadeat details
// platform (independent entity) can be side car --> notificcation service.  --> user can subscribe for it (observable pattern) subject is platform and users are observers.






// Tradeoff
// Locking mechanism for booking and then releasing it if not successed
// cuncerrency handling for booking the tickets (optimistic locking)
// CAP - Consistent and partition tolerant system.  - we can go for eventual consistency for the booking and payment part.

// 


//



enum TicketStatus {
    BLOCKED = "BLOCKED",
    BOOKED = "BOOKED",
    CANCELLED = "CANCELLED"
}
interface TicketLifecycleState {
    booked(ticket: ticket): void;
    cancle(ticket: ticket): void;
    block(ticket: ticket): void;
}

// Context class
class ticket {
    private state: TicketLifecycleState;

    constructor() {
        this.state = new blockstate(); // Initial state is Draft
    }

    setState(state: TicketLifecycleState): void {
        this.state = state;
    }

    block(): void {
        this.state.block(this);
    }

    booked(): void {
        this.state.booked(this);
    }

    cancle(): void {
        this.state.cancle(this);
    }
}

class blockstate implements TicketLifecycleState {
    block(ticket: ticket): void {
        console.log("Cannot block a ticket in booked state.");
    }
    booked(ticket: ticket): void {
        console.log("Booking the ticket...");
        // 15min locking and algorithm for booking the ticket.
        // etags (sentiel) - version number for the ticket and while booking the ticket we can check the version number and if it is same then we can book the ticket otherwise we can throw an error that the ticket is already booked by someone else.
        // 
        ticket.setState(new bookedstate());
    }
    cancle(ticket: ticket): void {
        console.log("Cannot Cancelling the ticket an it is in block state.");
    }
}

class bookedstate implements TicketLifecycleState {
    block(ticket: ticket): void {
        console.log("Cannot block a ticket in booked state.");
    }
    booked(ticket: ticket): void {
        console.log("Ticket is already in booked state.");
    }
    cancle(ticket: ticket): void {
        console.log("Cancelling the ticket...");
        ticket.setState(new cancelstate());
    }       
}
class cancelstate implements TicketLifecycleState {
    block(ticket: ticket): void {
        console.log("Cannot block a ticket in cancelled state.");
    }
    booked(ticket: ticket): void {
        console.log("Cannot book a ticket in cancelled state.");
    }
    cancle(ticket: ticket): void {
        console.log("Ticket is already in cancelled state.");
    }
}

class show {

}


class users {

}



