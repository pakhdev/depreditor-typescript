import SelectedElement from './selected-element.ts';

class StoredSelection {

    constructor(
        public readonly editableDiv: HTMLDivElement,
        public readonly startElement: SelectedElement,
        public readonly endElement: SelectedElement,
        public readonly commonAncestor: SelectedElement,
    ) {}

    private getIndexInCommonAncestor(element: SelectedElement): number {
        if (this.commonAncestor.node.nodeType === Node.TEXT_NODE)
            return element.offset.start;

        if (!this.commonAncestor.node.hasChildNodes())
            throw new Error('El nodo común no tiene nodos hijos');

        return Array
            .from(this.commonAncestor.node.childNodes)
            .indexOf(element.node as ChildNode);
    }

    public get startIndexInCommonAncestor(): number {
        return this.getIndexInCommonAncestor(this.startElement);
    }

    public get endIndexInCommonAncestor(): number {
        return this.getIndexInCommonAncestor(this.endElement);
    }

    public get isNothingSelected(): boolean {
        return this.isSameElement && this.startElement.offset.start === this.startElement.offset.end;
    }

    public get isSameElement(): boolean {
        return JSON.stringify(this.startElement.path) === JSON.stringify(this.endElement.path);
    }

    public get asRange(): Range {
        const range = document.createRange();
        range.setStart(this.startElement.ownerEditor, this.startElement.offset.start);
        range.setEnd(this.endElement.ownerEditor, this.endElement.offset.end);
        return range;
    }
}

export default StoredSelection;