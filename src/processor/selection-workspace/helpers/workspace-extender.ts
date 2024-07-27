import StoredSelection from '../../../core/selection/helpers/stored-selection.ts';
import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';
import Core from '../../../core/core.ts';
import SelectedElement from '../../../core/selection/helpers/selected-element.ts';

class WorkspaceExtender {
    constructor(
        private readonly workspaceSelection: StoredSelection,
        private readonly core: Core,
    ) {}

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

    public selectNext(restrictedContainers: ContainerProperties[]): void {
        if (!this.workspaceSelection.isNothingSelected)
            return;

        if (this.workspaceSelection.commonAncestor.node.nodeType === Node.TEXT_NODE) {
            if (this.selectNextChar(this.workspaceSelection.startElement))
                return;
        }
        // Select next node
    }

    private selectPrevious(restrictedContainers: ContainerProperties[]): void {
        if (!this.workspaceSelection.isNothingSelected)
            return;

        if (this.workspaceSelection.commonAncestor.node.nodeType === Node.TEXT_NODE) {
            if (this.selectPreviousChar(this.workspaceSelection.startElement))
                return;
        }
        // Select previous node
    }

    private selectChar(selectedElement: SelectedElement, isNext: boolean): boolean {
        if (selectedElement.node.nodeType === Node.TEXT_NODE) {
            const textNode = selectedElement.node as Text;
            const { start, end } = selectedElement.offset;
            const maxLength = textNode.length;
            const newOffset = isNext ? end + 1 : start - 1;

            if ((isNext && newOffset <= maxLength) || (!isNext && newOffset >= 0)) {
                this.workspaceSelection.updateAllSelectionPoints({
                    offset: isNext ? { end: newOffset } : { start: newOffset },
                });
                return true;
            }
        }
        return false;
    }

    private selectNextChar(selectedElement: SelectedElement): boolean {
        return this.selectChar(selectedElement, true);
    }

    private selectPreviousChar(selectedElement: SelectedElement): boolean {
        return this.selectChar(selectedElement, false);
    }

}

export default WorkspaceExtender;