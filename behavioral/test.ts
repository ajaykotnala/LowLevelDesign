interface notification {
    send(): void;
}

class smsNotification implements notification {
    send(): void {
        console.log("sms notification implementation");
    }
}

class emailNotification implements notification {
    send(): void {
        console.log("email notification implementation");
    }
}

class pushNotification implements notification {
    send(): void {
        console.log("push notification implementation");
    }
}

class notificationStrategy {
    private _notification: notification;
    constructor(notification: notification) {
        this._notification = notification;
    }
    setStrategy(notification: notification) {
        this._notification = notification;
    }
    executeStrategy() {
        this._notification.send();
    }
}


class clientcode {
    main() {
        const notificationStrategyInstance = new notificationStrategy(new smsNotification());
        notificationStrategyInstance.executeStrategy(); // Output: sms notification implementation

    }
}

export { };