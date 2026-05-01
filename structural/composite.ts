interface FileSystem {
    size(): string;
    listcommand(): void
}

class file implements FileSystem {
    private name = "";
    private space = "0";

    constructor(name: string, space: string) {
        this.name = name;
        this.space = space;
    }

    size(): string {
        return this.space;
    }

    listcommand(): void {
        console.log(`File Name is ${this.name} and size is ${this.space}`)
    }
}

class directory implements FileSystem {
    private name = "";
    private space = "0";
    folderlist: FileSystem[] = [];

    constructor(name: string, space: string) {
        this.name = name;
        this.space = space;
    }

    size(): string {
        let totalspace = 0;
        for (let i = 0; i < this.folderlist.length; i++) {
            totalspace += parseInt(this.folderlist[i].size())
        }
        this.space = totalspace.toString();
        return this.space;
    }

    listcommand(): void {
        console.log(`Directory Name is ${this.name} and size is ${this.space}`)
        for (let i = 0; i < this.folderlist.length; i++) {
            this.folderlist[i].listcommand();
        }
    }

    addfile(filesystem: FileSystem) {
        this.folderlist.push(filesystem);
    }

}


class clientcode {
    main() {
        // let fileinstance = 
        let dsainstance = new directory("DSA", "0");
        dsainstance.addfile(new file("slidingalgo.java", "2"));
        dsainstance.addfile(new file("linklist.ts", "3"))

        dsainstance.size();
        dsainstance.listcommand();
        // fileinstance.listcommand()

        let LLDinstance = new directory("lld", "0");
        LLDinstance.addfile(new file("factorypattern.java", "25"));
        LLDinstance.addfile(new file("ccompositivepattern.ts", "31"))

        LLDinstance.size();
        LLDinstance.listcommand();
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
