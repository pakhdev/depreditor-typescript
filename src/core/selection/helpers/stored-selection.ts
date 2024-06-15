import { SelectedElement } from './selected-element.ts';

export class StoredSelection {

    constructor(
        public readonly startElement: SelectedElement,
        public readonly endElement: SelectedElement,
        public readonly commonAncestor: SelectedElement
    ) {}

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