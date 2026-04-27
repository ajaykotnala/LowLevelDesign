interface notification {
    getFailedNotification():void;
}

class smsFailedNotification implements notification {
    getFailedNotification(): void {
        console.log("sms failed notification");
    }
}

class emailFailedNotification implements notification {
    getFailedNotification(): void {
        console.log("email failed notification");
    }
}

class notificationFactory{
    private static notificationfactoryinstance: notificationFactory;
    private constructor(){}
    public static getnotificationfactoryinstance():notificationFactory{
        if(!notificationFactory.notificationfactoryinstance){
            notificationFactory.notificationfactoryinstance = new notificationFactory();
        }
        return notificationFactory.notificationfactoryinstance;
    }
    public sendFailedNotification(notificationtype: string): notification {
        if(notificationtype === "sms"){
            return new smsFailedNotification();
        }
        if(notificationtype === "email"){
            return new emailFailedNotification();
        }
        throw new Error("invalid notification type");
    }
}


class clientcode{
    main(){
        let factoryinstance = notificationFactory.getnotificationfactoryinstance();
        let factoryinstance2 = notificationFactory.getnotificationfactoryinstance();
        console.log(factoryinstance === factoryinstance2);
        factoryinstance = null;
        factoryinstance =notificationFactory.getnotificationfactoryinstance();
        console.log(factoryinstance === factoryinstance2);
       // factoryinstance.sendFailedNotification("sms").getFailedNotification();
        //factoryinstance.sendFailedNotification("email").getFailedNotification();
    }
}

new clientcode().main();
export {};