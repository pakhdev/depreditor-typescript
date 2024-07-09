import SelectedElement from './selected-element.ts';
import StoredSelection from './stored-selection.ts';

class DomSelection {

    public static get(editableDiv: HTMLDivElement): StoredSelection {
        const selection = window.getSelection();
        if (!selection || !this.isSelectionOnEditor(selection, editableDiv))
            return this.getFallbackSelection(editableDiv);

        const range = selection.getRangeAt(0);
        const sameNode = range.startContainer === range.endContainer;
        const startElement = new SelectedElement(
            editableDiv,
            range.startContainer,
            {
                start: range.startOffset,
                end: sameNode ? range.endOffset : undefined,
            },
        );
        const endElement = new SelectedElement(
            editableDiv,
            range.endContainer,
            {
                start: sameNode ? range.startOffset : 0,
                end: range.endOffset,
            },
        );
        const commonAncestor = new SelectedElement(
            editableDiv,
            range.commonAncestorContainer,
            { start: 0 },
        );
        return new StoredSelection(startElement, endElement, commonAncestor);
    }

    private static getFallbackSelection(editableDiv: HTMLDivElement): StoredSelection {
        const firstNode = this.findFirstTextNode(editableDiv) || editableDiv;
        const offset = { start: 0, end: 0 };
        const startElement = new SelectedElement(editableDiv, firstNode, { ...offset });
        const endElement = new SelectedElement(editableDiv, firstNode, { ...offset });
        const commonAncestor = new SelectedElement(editableDiv, firstNode, { ...offset });
        return new StoredSelection(startElement, endElement, commonAncestor);
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

export default DomSelection;