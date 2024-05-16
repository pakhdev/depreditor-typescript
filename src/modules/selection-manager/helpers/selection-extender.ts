import { ContainerProps } from '../../../types/container-props.type.ts';
import { detectFormattingNode } from '../../../helpers/detectFormattingNode.helper.ts';
import { NodeSelection } from './node-selection.ts';
import { SelectionManager } from '../selection-manager.ts';

export class SelectionExtender {

    private readonly editableDiv: HTMLDivElement;
    private readonly startSelectionNode: NodeSelection;
    private readonly endSelectionNode: NodeSelection;
    private readonly commonAncestor: Node;

    constructor(
        private readonly formatting: ContainerProps,
        private readonly selectionManager: SelectionManager,
    ) {
        this.editableDiv = selectionManager.editableDiv;
        this.startSelectionNode = selectionManager.startSelectionNode;
        this.endSelectionNode = selectionManager.endSelectionNode;
        this.commonAncestor = selectionManager.commonAncestorNode;
    }

    /**
     * Busca el nodo padre más adecuado para preservar en un contexto específico de los nodos seleccionados.
     * Devuelve los nodos padre a preservar y el ancestro común de los nodos seleccionados.
     */
    public extendSelection(): Node {
        const startParent = this.findParentToPreserve(this.startSelectionNode);
        const endParent = this.findParentToPreserve(this.endSelectionNode);
        let commonAncestor: Node = this.commonAncestor;

        if (startParent || endParent) {
            const newCommonAncestor = this.findCommonAncestor(startParent, endParent);
            if (newCommonAncestor)
                commonAncestor = newCommonAncestor;
            else
                throw new Error('No se encontró el ancestro común de los nodos seleccionados.');
        }

        return commonAncestor;
    }

    /**
     * Busca el ancestro común de los nodos indicados.
     */
    private findCommonAncestor(
        startNode: Node | null = this.startSelectionNode.node,
        endNode: Node | null = this.endSelectionNode.node,
    ): Node {
        let startParent: Node | null = startNode;
        let endParent: Node | null = endNode;

        while (startParent && endParent) {
            startParent = startParent.parentNode;
            endParent = endParent.parentNode;

            if (startParent?.contains(endNode)) {
                this.selectionManager.commonAncestor = startParent;
                return startParent;
            }
            if (endParent?.contains(endNode)) {
                this.selectionManager.commonAncestor = endParent;
                return endParent;
            }
        }

        throw new Error('No se encontró el ancestro común de los nodos seleccionados.');
    }

    /**
     * Busca y selecciona el nodo padre más adecuado para preservar en un contexto específico, útil cuando se
     * requiere dividir el nodo en partes.
     * Recorre los nodos padres desde el nodo actual hasta el contenedor editable, buscando un nodo que coincida
     * con el formato especificado o con el grupo de formatos especificado.
     * Si el formato buscado es un bloque, se selecciona el nodo padre que no sea un bloque, ya que colocar bloques
     * dentro de elementos inline no es una práctica recomendada.
     */
    private findParentToPreserve(nodeSelection: NodeSelection): Node | null {
        let parent: Node | null = nodeSelection.node.parentNode;
        while (parent !== this.editableDiv && parent !== null) {
            const formattingNode = detectFormattingNode(parent);

            if (formattingNode && (formattingNode.name === this.formatting.name
                || this.formatting.isBlock && !formattingNode.isBlock
                || formattingNode.groups?.some(value => this.formatting.groups?.includes(value))))
                return parent;

            if (!parent.parentNode)
                throw new Error('No se encontró el nodo padre');

            parent = parent.parentNode;
        }

        return null;
    }
}
