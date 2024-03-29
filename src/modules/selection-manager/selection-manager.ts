import { NodeSelection } from './node-selection.ts';
import { ContainerProps } from '../../types/container-props.type.ts';

export class SelectionManager {

    public isRange: boolean = false;
    public commonAncestor: Node;
    public startNode: NodeSelection;
    public endNode: NodeSelection;

    constructor(public readonly editableDiv: HTMLDivElement) {
        const selection = window.getSelection();
        if (!selection?.focusNode || !this.editableDiv.contains(selection.anchorNode) || !selection.rangeCount) {
            const firstNode = this.findFirstTextNode(this.editableDiv) || this.editableDiv;
            this.commonAncestor = firstNode;
            this.startNode = new NodeSelection(firstNode).setEnd(0);
            this.endNode = new NodeSelection(firstNode).setEnd(0);
            return;
        }
        const range = selection!.getRangeAt(0);
        const { startOffset, endOffset } = range;

        this.startNode = range.startContainer.nodeType === Node.TEXT_NODE
            ? new NodeSelection(range.startContainer)
            : range.startContainer.childNodes.length
                ? new NodeSelection(range.startContainer.childNodes[range.startOffset])
                : new NodeSelection(range.startContainer);
        this.endNode = range.endContainer.nodeType === Node.TEXT_NODE
            ? new NodeSelection(range.endContainer)
            : range.endContainer.childNodes.length
                ? new NodeSelection(range.endContainer.childNodes[range.endOffset])
                : new NodeSelection(range.endContainer);

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
        if (!this.startNode.node || !this.endNode.node) return this;
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

    private findFirstTextNode(node: Node): Node | null {
        if (node.nodeType === Node.TEXT_NODE) return node;
        const children = Array.from(node.childNodes);
        for (let child of children) {
            const found = this.findFirstTextNode(child);
            if (found) return found;
        }
        return null;
    }

}