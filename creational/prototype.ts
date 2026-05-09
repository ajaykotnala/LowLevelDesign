class Product {
    name: string;
    price: number;
    quantity: number;
    description: string;
    constructor(name: string, price: number, quantity: number, description: string) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.description = description;
    }
}

class prototypeforproduct {
    private product: Product;
    constructor(product: Product) {
        this.product = product;
    }
    clone(): Product {
        return new Product(this.product.name, this.product.price, this.product.quantity, this.product.description);
    }
}

class clientcode {
    main() {
        const product = new Product("Laptop", 1000, 1, "This is a laptop");
        const prototype = new prototypeforproduct(product);
        const clonedProduct = prototype.clone();
        console.log(clonedProduct);
    }
}

new clientcode().main();
export {};