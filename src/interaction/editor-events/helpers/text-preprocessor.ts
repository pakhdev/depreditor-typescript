class TextPreprocessor {

    constructor(private text: string) {}

    public sanitize(): TextPreprocessor {
        let text = this.text.replace(/&/g, '&amp;');
        text = text.replace(/</g, '&lt;');
        text = text.replace(/>/g, '&gt;');
        text = text.replace('\t', '  ');
        text = text.replace(/\n/g, '<br>');
        return this;
    }

    public containsBreakLine(): boolean {
        return this.text.includes('\n');
    }

    public getAsHtml(): Node[] {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.text.replace(/\n/g, '<br>');
        return Array.from(tempDiv.childNodes);
    }

    public getAsText(): string {
        return this.text;
    }
}

export default TextPreprocessor;