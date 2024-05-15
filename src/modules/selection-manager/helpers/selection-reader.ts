import { NodeSelection } from './node-selection.ts';
import { SelectionData } from '../interfaces/selection-data.interface.ts';

export class SelectionReader {
    constructor(private readonly editableDiv: HTMLDivElement) {}

    public getSelectionDetails(): SelectionData {
        const selection = window.getSelection();
        if (!selection || !this.isSelectionOnEditor(selection))
            return this.getFallbackSelection();

        const range = selection.getRangeAt(0);
        const sameNode = range.startContainer === range.endContainer;
        return {
            isRange: !selection.isCollapsed,
            commonAncestor: range.commonAncestorContainer,
            startNode: new NodeSelection(range.startContainer, range.startOffset)
                .setStart(range.startOffset)
                .setEnd(sameNode ? range.endOffset : undefined),
            endNode: new NodeSelection(range.endContainer, range.endOffset)
                .setStart(sameNode ? range.startOffset : 0)
                .setEnd(range.endOffset),
        };
    }

    private getFallbackSelection(): SelectionData {
        const firstNode = this.findFirstTextNode(this.editableDiv) || this.editableDiv;
        return {
            isRange: false,
            commonAncestor: firstNode,
            startNode: new NodeSelection(firstNode).setEnd(0),
            endNode: new NodeSelection(firstNode).setEnd(0),
        };
    }

    private findFirstTextNode(node: Node): Node | null {
        if (node.nodeType === Node.TEXT_NODE) return node;
        for (const child of node.childNodes) {
            const found = this.findFirstTextNode(child);
            if (found) return found;
        }
        return null;
    }

    private isSelectionOnEditor(selection: Selection): boolean {
        return !!(selection?.focusNode && this.editableDiv.contains(selection.anchorNode) && selection.rangeCount);
    }
}
