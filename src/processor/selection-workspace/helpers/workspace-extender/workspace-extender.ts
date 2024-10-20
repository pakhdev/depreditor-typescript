import AdjacentPartSelector from './helpers/adjacent-part-selector.ts';
import StoredSelection from '../../../../core/selection/helpers/stored-selection.ts';
import SelectionWorkspace from '../../selection-workspace.ts';
import SelectedElement from '../../../../core/selection/helpers/selected-element.ts';

class WorkspaceExtender {
    constructor(
        private readonly workspace: SelectionWorkspace,
        private readonly workspaceSelection: StoredSelection,
    ) {}

    // Selecciona el contenido del nodo de texto actual
    public selectFully(): void {
        const { startElement, endElement } = this.workspaceSelection;
        for (const element of [startElement, endElement]) {
            if (element.node.nodeType === Node.TEXT_NODE) {
                const textNode = element.node as Text;
                element.offset = { start: 0, end: textNode.length };
            }
        }
    }

    // Asegura que el nodo estará cubierto por la selección sin modificar el principio y el final de la selección
    public coverNode(node: Node): void {
        if (this.workspaceSelection.commonAncestor.node === node)
            return;
        if (this.workspaceSelection.commonAncestor.node.contains(node))
            return;
        if (!node.parentNode)
            throw new Error('No se puede cubrir el nodo porque no tiene nodo padre');
        this.workspaceSelection.setCommonAncestorNode(node.parentNode);
    }

    public outsideInlineParents(): void {
        while (this.workspace.hasInlineParent) {
            const parentNode = this.workspaceSelection.commonAncestor.parentNode;
            this.workspaceSelection.setCommonAncestorNode(parentNode);
        }
    }

    public selectNode(node: Node): void {
        if (!this.workspaceSelection.editableDiv.contains(node))
            throw new Error('No se puede seleccionar un nodo que no se encuentra en el div editable');

        const parentNode = node.parentNode;
        if (!parentNode)
            throw new Error('No se puede seleccionar un nodo sin padre');

        let offset = node.nodeType === Node.TEXT_NODE
            ? { start: 0, end: (node as Text).length }
            : { start: 0, end: 1 };

        if (node.nodeType !== Node.TEXT_NODE) {
            const { position } = new SelectedElement(this.workspaceSelection.editableDiv, node);
            offset = { start: position, end: position + 1 };
            node = parentNode;
        }

        this.workspaceSelection.updateAllSelectionPoints({ node, offset });
    }

    public selectNext(): 'char' | 'element' | 'range' | null {
        return new AdjacentPartSelector(this.workspaceSelection).selectNext();
    }

    public selectPrevious(): 'char' | 'element' | 'range' | null {
        return new AdjacentPartSelector(this.workspaceSelection).selectPrevious();
    }

}

export default WorkspaceExtender;