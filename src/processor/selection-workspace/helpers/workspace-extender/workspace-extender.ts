import AdjacentPartSelector from './helpers/adjacent-part-selector.ts';
import StoredSelection from '../../../../core/selection/helpers/stored-selection.ts';

class WorkspaceExtender {
    constructor(private readonly workspaceSelection: StoredSelection) {}

    public selectFully(): void {
        const { startElement, endElement } = this.workspaceSelection;
        for (const element of [startElement, endElement]) {
            if (element.node.nodeType === Node.TEXT_NODE) {
                const textNode = element.node as Text;
                element.offset = { start: 0, end: textNode.length };
            }
        }
    }

    public coverNode(node: Node): void {
        if (this.workspaceSelection.commonAncestor.node === node)
            return;
        if (this.workspaceSelection.commonAncestor.node.contains(node))
            return;
        if (!node.parentNode)
            throw new Error('No se puede cubrir el nodo porque no tiene nodo padre');
        this.workspaceSelection.setCommonAncestorNode(node.parentNode);
    }

    public selectNext(): void {
        return new AdjacentPartSelector(this.workspaceSelection).selectNext();
    }

    public selectPrevious(): void {
        return new AdjacentPartSelector(this.workspaceSelection).selectPrevious();
    }
}

export default WorkspaceExtender;