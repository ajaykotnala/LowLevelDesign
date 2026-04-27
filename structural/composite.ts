
interface FileSystem {
    size(): string;
    listcommand(): void
}

class file implements FileSystem {
    private name = "";
    private space = "0MB";

    constructor(name: string, space: string) {
        this.name = name;
        this.space = space;
    }

    size(): string {
        return this.space;
    }

    listcommand(): void {
        console.log(`File Name is ${this.name} and size is ${this.size}`)
    }
}

class folder implements FileSystem {
    private name = "";
    private space = "0MB";

    constructor(name: string, space: string) {
        this.name = name;
        this.space = space;
    }

    size(): string {
        return this.space;
    }

    listcommand(): void {
        console.log(`File Name is ${this.name} and size is ${this.size}`)
    }
}


class clientcode {
    main() {
        let fileinstance = new file("LLD.docx", "20MB")
        fileinstance.listcommand()
    }
}
new clientcode().main();
export { }



/* 
Bruite force
class file {
    private name = "";
    private size = "0MB";

    constructor(name: string, size: string) {
        this.name = name;
        this.size = size;
    }

    getFileDetials() {
        console.log(`File Name is ${this.name} and size is ${this.size}`)
    }
}

class clientcode {
    main() {
        let fileinstance = new file("LLD.docx", "20MB")
        fileinstance.getFileDetials()
    }
} */
