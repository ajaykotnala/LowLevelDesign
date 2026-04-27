interface notification {
    send(): void;
}

interface notificationformatter {
    format(): void;
}

class SMSNotification implements notification {
    send() {
        console.log("SMS Notification sent");
    }
}

class emailNotification implements notification {
    send() {
        console.log("Email Notification sent");
    }
}

class SMSNotificationFormatter implements notificationformatter {
    format() {
        console.log("SMS Notification format");
    }
}

class emailNotificationFormatter implements notificationformatter {
    format() {
        console.log("Email Notification format");
    }
}

interface abstractnotificationfactory {
    sendNotificationInstance(): notification;
    sendNotificationFormatterInstance(): notificationformatter
}

class smsNotificationFactory implements abstractnotificationfactory {
    sendNotificationFormatterInstance(): notificationformatter {
        return new SMSNotificationFormatter();
    }
    sendNotificationInstance(): notification {
        return new SMSNotification();
    }
}

class emailNotificationFactory implements abstractnotificationfactory {
    sendNotificationFormatterInstance(): notificationformatter {
        return new emailNotificationFormatter
    }
    sendNotificationInstance(): notification {
        return new emailNotification();
    }
}


class ImplementationabstractfactoryImplementation {
    sendImplementationInstance(notificationtype: string): abstractnotificationfactory {
        if (notificationtype === "sms") {
            return new smsNotificationFactory();
        } else {
            return new emailNotificationFactory();
        }
    }
}

class clientdemo {
    main() {
        const smsobject = new ImplementationabstractfactoryImplementation();
        let smsnotificationinstance = smsobject.sendImplementationInstance("sms");
        
        smsnotificationinstance.sendNotificationFormatterInstance().format();
        smsnotificationinstance.sendNotificationInstance().send();
    }
}

new clientdemo().main();
export { };


// class notificationFactory {
//     sendNotificationInstance(notificationType: string): notification | null {
//         if (notificationType === "sms") {
//             return new SMSNotification();
//         }
//         else if (notificationType === "email") {
//             return new emailNotification();
//         }
//         return null;
//     }
// }

// class notificationformatterFactory {
//     sendNotificationFormatterInstance(notificationType: string): notificationformatter | null {
//         if (notificationType === "sms") {
//             return new SMSNotificationFormatter();
//         }
//         else if (notificationType === "email") {
//             return new emailNotificationFormatter();
//         }
//         return null;
//     }
// }

// class clientdemo {
//     main() {
//         const notificationfactory = new notificationFactory();
//         const smsNotification = notificationfactory.sendNotificationInstance("sms");
//         smsNotification?.send();
//         const emailNotification = notificationfactory.sendNotificationInstance("email");
//         emailNotification?.send();

//         const notificationformatterfactory = new notificationformatterFactory();
//         const smsNotificationFormatter = notificationformatterfactory.sendNotificationFormatterInstance("sms");
//         smsNotificationFormatter?.format();
//         const emailNotificationFormatter = notificationformatterfactory.sendNotificationFormatterInstance("email");
//         emailNotificationFormatter?.format();
//     }
// }