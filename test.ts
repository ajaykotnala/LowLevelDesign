interface INotification {
    send();
}

enum NotificationType{
    SMS
    Email
}
class SMSNotification implements INotification {
    send(){
    console.log("sms notification implementation")
    }
}

class EmailNotification implements INotification {
        send(){
        console.log("email notification implementation")
        }
    }

    class NotificationFactory(): INotification{
        getNotificationInstance(NotificationType type){
            if(type == NotificationType.SMS){
                return new smsNotification();
            }
            if(type == NotificationType.Email){
                return new emailNotification();
            }
        }
    }


    class clinetimplementation {
        let factory = new NotificationFactory();
        factory.getNotificationInstance(NotificationType.sms).send();
    }

export {};