import StoredSelection from '../../../../../core/selection/helpers/stored-selection.ts';
import SelectedElement from '../../../../../core/selection/helpers/selected-element.ts';

class AdjacentPartSelector {
    constructor(private readonly workspaceSelection: StoredSelection) {}

    public selectNext(): 'char' | 'element' | 'range' | null {
        if (!this.workspaceSelection.isNothingSelected)
            return 'range';

        if (this.workspaceSelection.commonAncestor.node.nodeType === Node.TEXT_NODE) {
            if (this.selectNextChar(this.workspaceSelection.startElement))
                return 'char';
        }
        return this.selectAdjacentNode(this.workspaceSelection.startElement, 'next');
    }

    public selectPrevious(): 'char' | 'element' | 'range' | null {
        if (!this.workspaceSelection.isNothingSelected)
            return 'range';

        if (this.workspaceSelection.commonAncestor.node.nodeType === Node.TEXT_NODE) {
            if (this.selectPreviousChar(this.workspaceSelection.startElement))
                return 'char';
        }
        return this.selectAdjacentNode(this.workspaceSelection.startElement, 'previous');
    }

    private selectAdjacentChar(selectedElement: SelectedElement, isNext: boolean): boolean {
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
        return this.selectAdjacentChar(selectedElement, true);
    }

    private selectPreviousChar(selectedElement: SelectedElement): boolean {
        return this.selectAdjacentChar(selectedElement, false);
    }

    private selectAdjacentNode(selectedElement: SelectedElement, direction: 'next' | 'previous'): 'element' | null {
        const nodeGetter = direction === 'next' ? this.getNextNode : this.getPreviousNode;
        let currentNode: Node | null | undefined = nodeGetter(selectedElement.node);

        while (currentNode) {
            const validNode = this.findValidNode(currentNode);
            if (validNode) {
                this.setSelectionNodes(validNode, direction === 'next');
                return 'element';
            }
            currentNode = nodeGetter(currentNode);
        }
        return null;
    }

    private setSelectionNodes(node: Node, selectStart: boolean): void {
        const isTextNode = node.nodeType === Node.TEXT_NODE;
        const length = isTextNode ? (node as Text).length : 1;
        const offset = {
            start: this.getStartOffset(isTextNode, selectStart, length),
            end: this.getEndOffset(isTextNode, selectStart, length),
        };

        this.workspaceSelection.updateAllSelectionPoints({ node, offset });

        if (!isTextNode && node.parentNode) {
            this.workspaceSelection.commonAncestor.setNode(node.parentNode);
            const nodePosition = this.workspaceSelection.startElement.position;
            this.workspaceSelection.commonAncestor.offset = {
                start: nodePosition,
                end: nodePosition + 1,
            };
        }
    }

    private getNextNode(node: Node): Node | null | undefined {
        return node.nextSibling ?? node.parentNode?.nextSibling;
    }

    private getPreviousNode(node: Node): Node | null | undefined {
        return node.previousSibling ?? node.parentNode?.previousSibling;
    }

    private getStartOffset(isTextNode: boolean, selectStart: boolean, length: number): number {
        if (!isTextNode) return 0;
        return selectStart ? 0 : length - 1;
    };

    private getEndOffset(isTextNode: boolean, selectStart: boolean, length: number): number {
        if (!isTextNode) return 0;
        return selectStart ? 1 : length;
    };

    private findValidNode(node: Node): Node | null {
        if (node.nodeType === Node.TEXT_NODE || !node.hasChildNodes())
            return node;
        for (const child of node.childNodes) {
            const validNode = this.findValidNode(child);
            if (validNode)
                return validNode;
        }
        return null;
    }
}

export default AdjacentPartSelector;