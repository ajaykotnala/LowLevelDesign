// Observer Design Pattern Example
// The Observer design pattern is a behavioral design pattern that defines a one-to-many relationship between objects. 
// In this pattern, an object (called the subject) maintains a list of its dependents (called observers) 
// and notifies them of any state changes, usually by calling one of their methods. 
// This pattern promotes loose coupling and allows for dynamic relationships between objects.

// Let's build a simple example of a blog system . 
// The blog system will be the subject, and the notify will be the observers.

// Define the Subject interface

interface observers {
    update(message: string): void; // Observer interface - all observers must implement this 
    // and also if anythings comes update the message to all the observers
}

interface Subject {
    subscribe(observer: observers): void; // Method to add an observer to the list
    unsubscribe(observer: observers): void; // Method to remove an observer from the list
    notify(message: string): void; // Method to notify all observers of a state change
}

// Concrete Subject - Blog System
class MediumBlog implements Subject {
    listOfObservers: observers[] = []; // List to hold all subscribed observers
    subscribe(observer: observers): void {
        this.listOfObservers.push(observer); // Add observer to the list        
    }
    unsubscribe(observer: observers): void {
        if (this.listOfObservers.includes(observer)) {
            console.log(`Observer unsubscribed successfully!`);
            this.listOfObservers = this.listOfObservers.filter(obs => obs !== observer); // Remove observer from the list
        } else {
            console.log(`Observer not found in the list!`);
        }
    }
    notify(message: string): void {
        console.log(`Notifying observers about new blog post: ${message}`);
        for (const observer of this.listOfObservers) {
            observer.update(message); // Notify each observer of the new blog post
        }
    }
}

class LinkedInBlog implements Subject {
    listOfObservers: observers[] = []; // List to hold all subscribed observers
    subscribe(observer: observers): void {
        this.listOfObservers.push(observer); // Add observer to the list        
    }
    unsubscribe(observer: observers): void {
        if (this.listOfObservers.includes(observer)) {
            console.log(`Observer unsubscribed successfully!`);
            this.listOfObservers = this.listOfObservers.filter(obs => obs !== observer); // Remove observer from the list
        } else {
            console.log(`Observer not found in the list!`);
        }
    }
    notify(message: string): void {
        console.log(`Notifying observers about new blog post: ${message}`);
        for (const observer of this.listOfObservers) {
            observer.update(message); // Notify each observer of the new blog post
        }
    }
}

// Concrete Observer - User
class User implements observers {
    private name: string;
    constructor(name: string) {
        this.name = name;
    }
    update(message: string): void {
        console.log(`${this.name} received notification: ${message}`); // User receives notification about new blog post
    }
}

// Client code to demonstrate the Observer pattern
class clientcode {
    main() {
        const mediumBlog = new MediumBlog();
        const linkedInBlog = new LinkedInBlog();

        const sri = new User("Sri");
        const kiran = new User("Kiran");
        const amol = new User("Amol");

        mediumBlog.subscribe(sri);
        mediumBlog.subscribe(kiran);
        linkedInBlog.subscribe(kiran);
        linkedInBlog.subscribe(amol);

        mediumBlog.notify("New blog post on Medium about Design Patterns!");
        console.log("\n");
        linkedInBlog.notify("New blog post on LinkedIn about Design Patterns!");

        console.log("\n");
        mediumBlog.unsubscribe(kiran);
        mediumBlog.notify("Another blog post on Medium about AI!");
    }
}

new clientcode().main();
export { };