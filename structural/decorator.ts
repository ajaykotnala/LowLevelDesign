interface editor {
    render(): void;
}

//basic editor
class texteditor implements editor {
    render() {
        console.log("basic text editor render");
    }
}

class spellcheck implements editor {
    private _editor;

    constructor(editor: editor) {
        this._editor = editor;
    }

    fspellcheck(): void {
        console.log("spellcheck got decorated");
    }

    render(): void {
        this._editor.render();
        this.fspellcheck()

    }

}

class autosave implements editor {
    private _editor;
    constructor(editor: editor) {
        this._editor = editor;
    }
    fautosave() {
        console.log("autosave got decorated");
    }
    render(): void {

        this._editor.render();
        this.fautosave();
    }
}

class preview implements editor {
    private _editor;
    constructor(editor: editor) {
        this._editor = editor;
    }
    fpreview() {
        console.log("preview got decorated")
    }
    render(): void {
        this._editor.render();
        this.fpreview();
    }
}


class clientcode {
    main() {
        //const basiceditorInstance: editor = new texteditor();
        //editorInstance.render();
        // const spellcheckInstance: editor = new spellcheck(new texteditor());

        //spellcheckInstance.render();
        // const autosaveInstance: editor = new autosave(new spellcheck(new texteditor()));
        // autosaveInstance.render();

        const previewInstance: editor = new preview(new autosave(new spellcheck(new texteditor())));
        previewInstance.render();
    }
}

new clientcode().main();
export { };
