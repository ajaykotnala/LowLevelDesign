interface chargertype {
    typeccharging(): void
}

class iphone implements chargertype {
    typeccharging(): void {
        console.log("Type C charger is compatiable")
    }
}

class iphone17 implements chargertype {
    typeccharging(): void {
        console.log("Type C charger is compatiable on iphone 17")
    }
}

// now one plus 6 is not tyepc -- lets say its usb type
class oneplus {
    usbcharging(): void {
        console.log("USB charger is compatiable")
    }
}

class chargeradaptor implements chargertype {
    private _oneplus
    constructor(oneplus: oneplus) {
        this._oneplus = oneplus;
    }
    typeccharging(): void {
        this._oneplus.usbcharging();
    }
}

/* class clientcode {
    main() {
        const iphonecharger = new iphone();
        iphonecharger.typeccharging();

        const chargeradaptorInstance = new chargeradaptor(new oneplus());
        chargeradaptorInstance.typeccharging();
    }
} */

// ----------------------------------------------------------

// another expample  
// payment: system expect pay(amount)
//legacy system has makePayment(amount)

interface payment {
    pay(amount: any): void
}

class rupeecard implements payment {
    pay(amount: any) {
        console.log(`rupee card payment is done ${amount}`);
    }
}

class mastercard {
    payamount(amount: any) {
        console.log(`master card payment is done ${amount}`);
    }
}

class paymentadaptor implements payment {
    private _mastercard
    constructor(mastercard: mastercard) {
        this._mastercard = mastercard;
    }
    pay(amount: any) {
        this._mastercard.payamount(amount);
    }
}

class clientcode {
    main() {
        const rupeecardInstance = new rupeecard();
        rupeecardInstance.pay(10);

        const paymentadaptorInstance = new paymentadaptor(new mastercard())
        paymentadaptorInstance.pay(20);

    }
}

// ----------------------------------------------------------

// another expample  homework
// payment: music system play concrete method
//legacy system relaxandplay for music

//another example
new clientcode().main()
export { }