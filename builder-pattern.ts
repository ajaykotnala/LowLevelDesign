class Product {
    private name: string;
    private price: number;
    private quantity: number;
    private description: string;
    constructor(name: string, price: number, quantity: number, description: string) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.description = description;
    }
    getProduct() {
        return this.name + " " + this.price + " " + this.quantity + " " + this.description;
    }
}

class ProductBuilder {
    private name: string = "";
    private price: number = 0;
    private quantity: number = 0;
    private description: string = "";

    setName(name: string) {
        this.name = name;
        return this;
    }

    setPrice(price: number) {
        this.price = price;
        return this;
    }

    setQuantity(quantity: number) {
        this.quantity = quantity;
        return this;
    }

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    build(): Product {
        return new Product(this.name, this.price, this.quantity, this.description);
    }
}

// Example usage
const product = new ProductBuilder()
    .setName("Laptop")
    .setPrice(799)
    .setQuantity(5)
    .setDescription("16GB RAM")
    .build();

console.log(product.getProduct());

export {};