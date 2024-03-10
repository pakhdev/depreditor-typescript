import { NodeSelection } from './node-selection.ts';

export class SelectionManager {

    public isOnEditableDiv: boolean = false;
    public isRange: boolean = false;
    public commonAncestor: Node;
    public startNode: NodeSelection;
    public endNode: NodeSelection;

    constructor(public readonly editableDiv: HTMLDivElement) {
        const selection = window.getSelection();
        if (!selection?.focusNode || !this.editableDiv.contains(selection.anchorNode)) {
            this.commonAncestor = this.editableDiv;
            this.startNode = new NodeSelection(this.editableDiv);
            this.endNode = this.startNode;
        }
        const range = selection!.getRangeAt(0);
        const { startOffset, endOffset } = range;

        this.isOnEditableDiv = true;
        this.startNode = range.startContainer.nodeType === Node.TEXT_NODE
            ? new NodeSelection(range.startContainer)
            : new NodeSelection(range.startContainer.childNodes[range.startOffset]);
        this.endNode = range.endContainer.nodeType === Node.TEXT_NODE
            ? new NodeSelection(range.endContainer)
            : new NodeSelection(range.endContainer.childNodes[range.endOffset - 1]);
        this.commonAncestor = range.commonAncestorContainer;
        this.isRange = !range.collapsed;

        if (this.startNode.node.nodeType === Node.TEXT_NODE) {
            this.startNode.setStart(startOffset);
            if (this.sameNode) this.startNode.setEnd(endOffset);
        }

        if (this.endNode.node.nodeType === Node.TEXT_NODE) {
            if (this.sameNode) this.endNode.setStart(startOffset);
            this.endNode.setEnd(endOffset);
        }
    }

    get sameNode(): boolean {
        return this.startNode.node === this.endNode.node;
    }

}