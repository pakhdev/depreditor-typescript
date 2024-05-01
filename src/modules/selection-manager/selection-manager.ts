import { ContainerProps } from '../../types/container-props.type.ts';
import { NodeSelection } from './node-selection.ts';

/**
 * Clase para gestionar la selección de nodos en el editor.
 * Si no hay selección, se toma el primer nodo de texto del editor.
 * Permite ajustar la selección y el nodo padre general para el tipo de contenedor que se le pase como parámetro,
 * evitando un posible doble contenedor del mismo tipo y asegurando que las etiquetas de bloque no se posicionen
 * dentro de etiquetas inline.
 */
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
        const {
            collapsed,
            commonAncestorContainer,
            endContainer,
            endOffset,
            startContainer,
            startOffset,
        } = selection!.getRangeAt(0);

        this.commonAncestor = commonAncestorContainer;
        this.isRange = !collapsed;
        this.startNode = this.createNodeSelection(startContainer, startOffset)
            .determineTextSelection({ start: startOffset, end: this.sameNode ? endOffset : undefined });
        this.endNode = this.createNodeSelection(endContainer, endOffset)
            .determineTextSelection({ start: this.sameNode ? startOffset : undefined, end: endOffset });
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

    private createNodeSelection(container: Node, offset: number): NodeSelection {
        if (container.nodeType === Node.TEXT_NODE)
            return new NodeSelection(container);
        else if (container.childNodes.length)
            return new NodeSelection(container.childNodes[offset]);
        else
            return new NodeSelection(container);
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