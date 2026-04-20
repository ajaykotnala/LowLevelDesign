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

interface NotificationFactory {
    createNotification(): notification;
}
class SMSNotificationFactory implements NotificationFactory {
    createNotification() {
        return new SMSNotification();
    }
}

class EmailNotificationFactory implements NotificationFactory {
    createNotification() {
        return new EmailNotification();
    }
}

class clientcode {
    main() {
        let notificationFactory = new SMSNotificationFactory();
        let notification = notificationFactory.createNotification();
        notification.send();


        notificationFactory = new EmailNotificationFactory();
        notification = notificationFactory.createNotification();
        notification.send();
    }
}

new clientcode().main();

export { };
