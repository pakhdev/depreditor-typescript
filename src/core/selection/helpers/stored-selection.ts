import AffectedNodes from '../interfaces/affected-nodes.interface.ts';
import AffectedNodesFetcher from './affected-nodes-fetcher.ts';
import SelectedElement from './selected-element.ts';
import SelectionParams from '../interfaces/selection-params.interface.ts';
import AffectedNodesPart from '../enums/affected-nodes-part.enum.ts';

class StoredSelection {

    constructor(
        public readonly editableDiv: HTMLDivElement,
        public readonly startElement: SelectedElement,
        public readonly endElement: SelectedElement,
        public commonAncestor: SelectedElement,
    ) {}

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

    public setCommonAncestorNode(commonAncestor: Node): void {
        this.commonAncestor = new SelectedElement(this.editableDiv, commonAncestor);
    }

    public updateAllSelectionPoints(selectionParams: SelectionParams): void {
        if (!this.isNothingSelected)
            throw new Error('No se puede actualizar todos los puntos de la selección si no son iguales');

        for (const element of [this.startElement, this.endElement, this.commonAncestor]) {
            if (selectionParams.node)
                element.setNode(selectionParams.node);
            if (selectionParams.offset)
                element.offset = { ...element.offset, ...selectionParams.offset };
        }
    }

    public getAffectedNodes(part: AffectedNodesPart): AffectedNodes[] {
        return AffectedNodesFetcher.get(this, part);
    }

    private getIndexInCommonAncestor(element: SelectedElement): number {
        if (this.commonAncestor.node.nodeType === Node.TEXT_NODE)
            return element.offset.start;

        if (!this.commonAncestor.node.hasChildNodes())
            throw new Error('El nodo común no tiene nodos hijos');

        const commonAncestorChildren = Array.from(this.commonAncestor.node.childNodes);
        const elementOrContainer = commonAncestorChildren.find(childNode => childNode.contains(element.node));
        return commonAncestorChildren.indexOf(elementOrContainer as ChildNode);
    }

}

export default StoredSelection;