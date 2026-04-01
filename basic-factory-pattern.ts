interface notification {
    send(): void;
}

class SMSNotification implements notification {
    send() {
        console.log("SMS Notification sent");
    }
}

class EmailNotification implements notification {
    send() {
        console.log("Email Notification sent");
    }
}

class notificationFactory {
    sendNotification(notificationType: string): notification {
        if (notificationType === "sms") {
            return new SMSNotification();
        } else if (notificationType === "email") {
            return new EmailNotification();
        } else {
            throw new Error("Invalid notification type");
        }
    }
}

class clientcode {
    main() {
        const notificationfactory = new notificationFactory();
        const smsNotification = notificationfactory.sendNotification("sms");
        smsNotification.send();
        const emailNotification = notificationfactory.sendNotification("email");
        emailNotification.send();
    }
}

new clientcode().main();


export {};
