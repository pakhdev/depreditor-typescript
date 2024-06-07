import { NodeSelection } from './node-selection.ts';
import { SelectionData } from '../interfaces/selection-data.interface.ts';

export class DomSelection {

    public static get(editableDiv: HTMLDivElement): SelectionData {
        const selection = window.getSelection();
        if (!selection || !this.isSelectionOnEditor(selection, editableDiv))
            return this.getFallbackSelection(editableDiv);

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

    private static getFallbackSelection(editableDiv: HTMLDivElement): SelectionData {
        const firstNode = this.findFirstTextNode(editableDiv) || editableDiv;
        return {
            isRange: false,
            commonAncestor: firstNode,
            startNode: new NodeSelection(firstNode).setEnd(0),
            endNode: new NodeSelection(firstNode).setEnd(0),
        };
    }

    private static findFirstTextNode(node: Node): Node | null {
        if (node.nodeType === Node.TEXT_NODE) return node;
        for (const child of node.childNodes) {
            const found = this.findFirstTextNode(child);
            if (found) return found;
        }
        return null;
    }

    private static isSelectionOnEditor(selection: Selection, editableDiv: HTMLDivElement): boolean {
        return !!(selection?.focusNode && editableDiv.contains(selection.anchorNode) && selection.rangeCount);
    }
}
