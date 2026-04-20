interface coffee {
    serve(): void;
}

//basic coffee
//black coffee -- remove milk
// sugerless -- remove sugar

class basiccoffee implements coffee {
    serve(): void {
        console.log("Basic coffee serve")
    }
}

class blackcoffee implements coffee {
    private _coffee;
    constructor(coffee: coffee) {
        this._coffee = coffee;
    }
    fblackcoffee(): void {
        console.log("decorating black coffee by removing milk");
    }
    serve(): void {
        this.fblackcoffee();
        this._coffee.serve();

    }
}

class sugerlesscoffee implements coffee {
    private _coffee;
    constructor(coffee: coffee) {
        this._coffee = coffee
    }
    fsugerlesscoffee() {
        console.log("decorating sugerless coffee by removing sugar");
    }
    serve(): void {
        this.fsugerlesscoffee()
        this._coffee.serve()
    }
}

class clientcode{
    main(){
        //const basiccoffeeInstance = new basiccoffee();
        //basiccoffeeInstance.serve();

        //const blackcoffeeInstance = new blackcoffee(new basiccoffee())
        //blackcoffeeInstance.serve();

        const sugerlesscoffeeInstance = new sugerlesscoffee(new blackcoffee(new basiccoffee))
        sugerlesscoffeeInstance.serve();
    }
}

new clientcode().main();
export{}