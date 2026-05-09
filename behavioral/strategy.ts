// Stratergy Design pattern is a behavioral design pattern that enables selecting an algorithm's behavior at runtime. 
// It defines a family of algorithms, encapsulates each one, and makes them interchangeable. 
// This pattern allows the algorithm to vary independently from clients that use it.

// Let's build a simple example of a payment processing system where we have multiple payment methods: Credit Card, PayPal, and UPI.
// We will define a common interface for all payment methods and then create concrete classes for each payment method. 
// The client code will use the strategy pattern to select the appropriate payment method at runtime based on user input.

// Define the Strategy interface

interface PaymentStrategy {
    pay(amount: number): void; // Method to process payment
}

// Concrete Strategy for Credit Card payment
class CreditCardPayment implements PaymentStrategy {
    private cardNumber: string;
    private cardHolderName: string;
    private cvv: string;

    constructor(cardNumber: string, cardHolderName: string, cvv: string) {
        this.cardNumber = cardNumber;
        this.cardHolderName = cardHolderName;
        this.cvv = cvv;
    }

    pay(amount: number): void {
        console.log(`Processing credit card payment of $${amount} for card holder ${this.cardHolderName}`);
        // Here you would add logic to process the credit card payment
    }
}

// Concrete Strategy for PayPal payment
class PayPalPayment implements PaymentStrategy {
    private email: string;

    constructor(email: string) {
        this.email = email;
    }

    pay(amount: number): void {
        console.log(`Processing PayPal payment of $${amount} for email ${this.email}`);
        // Here you would add logic to process the PayPal payment
    }
}

// Concrete Strategy for UPI payment
class UPIPayment implements PaymentStrategy {
    private upiId: string;

    constructor(upiId: string) {
        this.upiId = upiId;
    }

    pay(amount: number): void {
        console.log(`Processing UPI payment of $${amount} for UPI ID ${this.upiId}`);
        // Here you would add logic to process the UPI payment
    }
}

// Context class that uses the PaymentStrategy
class PaymentContext {
    private strategy: PaymentStrategy;

    constructor(strategy: PaymentStrategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy: PaymentStrategy): void {
        this.strategy = strategy; // Method to change the payment strategy at runtime
    }

    executePayment(amount: number): void {
        this.strategy.pay(amount); // Execute the payment using the selected strategy
    }
}

// Client code to demonstrate the Strategy pattern
class Client {
    main() {
        const creditCardPayment = new CreditCardPayment("1234-5678-9012-3456", "Ajay", "123");
        const payPalPayment = new PayPalPayment("kotnala.ajay@gmail.com");
        const upiPayment = new UPIPayment("kotnala.ajay@upi");

        const paymentContext = new PaymentContext(creditCardPayment);
        paymentContext.executePayment(100); // Process payment using Credit Card

        paymentContext.setStrategy(payPalPayment);
        paymentContext.executePayment(200); // Process payment using PayPal

        paymentContext.setStrategy(upiPayment);
        paymentContext.executePayment(300); // Process payment using UPI
    }
}

new Client().main();
export { };