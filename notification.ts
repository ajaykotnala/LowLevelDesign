interface notify {
    send(): void
}

// email
//sms

class sms implements notify {
    send() {
        console.log("sms sent to client")
    }
}

class email implements notify {
    send() {
        console.log("email sent to client")
    }
}

class NotificationInstanceGenerator {
    notify(type: string) {
        if (type === "sms") {
            return new sms();
        }
        else {
            return new email();
        }
    }
}

class client {
    main() {
        let notifyI = new NotificationInstanceGenerator();
        let notification = notifyI.notify("email");
        notification.send()

    }
}