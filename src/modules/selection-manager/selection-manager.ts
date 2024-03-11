import { NodeSelection } from './node-selection.ts';
import { ContainerProps } from '../../types/container-props.type.ts';

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

        if (!this.startNode.node || !this.endNode.node)
            throw new Error('No se encontró el nodo de inicio o fin de selección');

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

    public adjustForFormatting(formatting: ContainerProps): SelectionManager {
        if (!this.isOnEditableDiv || !this.startNode.node || !this.endNode.node) return this;
        this.startNode.findParentToPreserve(formatting, this.editableDiv);
        this.endNode.findParentToPreserve(formatting, this.editableDiv);
        if (this.startNode.parentToPreserve || this.endNode.parentToPreserve)
            this.findCommonAncestor();
        return this;
    }

    private findCommonAncestor(): void {
        if (!this.startNode?.node || !this.endNode?.node)
            throw new Error('Faltan nodos de inicio o fin de selección');
        const preservingStartParent: Node = this.startNode.parentToPreserve || this.startNode.node;
        const preservingEndParent: Node = this.endNode.parentToPreserve || this.endNode.node;

        let startParent: Node | null = this.startNode.node;
        let endParent: Node | null = this.endNode.node;

        while (true) {
            startParent = startParent.parentNode;
            endParent = endParent.parentNode;
            if (!startParent || !endParent)
                throw new Error('No se encontró el ancestro común');
            if (startParent.contains(preservingEndParent)) {
                this.commonAncestor = startParent;
                break;
            }
            if (endParent.contains(preservingStartParent)) {
                this.commonAncestor = endParent;
                break;
            }
        }
    }

}