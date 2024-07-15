import SelectedElement from './selected-element.ts';
import StoredSelection from './stored-selection.ts';

class DomSelection {

    public static get(editableDiv: HTMLDivElement): StoredSelection {
        const selection = window.getSelection();
        if (!selection || !this.isSelectionOnEditor(selection, editableDiv))
            return this.getFallbackSelection(editableDiv);

        const range = selection.getRangeAt(0);
        const startElement = this.getStartNode(editableDiv, range);
        const endElement = this.getEndNode(editableDiv, range);
        const commonAncestor = new SelectedElement(
            editableDiv,
            range.commonAncestorContainer,
            { start: 0 },
        );
        return new StoredSelection(editableDiv, startElement, endElement, commonAncestor);
    }

    private static getStartNode(editableDiv: HTMLDivElement, range: Range): SelectedElement {
        return this.getSelectedNode(editableDiv, range, true);
    }

    private static getEndNode(editableDiv: HTMLDivElement, range: Range): SelectedElement {
        return this.getSelectedNode(editableDiv, range, false);
    }

    private static getSelectedNode(
        editableDiv: HTMLDivElement,
        range: Range,
        isStart: boolean,
    ): SelectedElement {
        const container = isStart ? range.startContainer : range.endContainer;
        const offset = isStart ? range.startOffset : range.endOffset;

        if (range.commonAncestorContainer === container && container.nodeType !== Node.TEXT_NODE) {
            return new SelectedElement(
                editableDiv,
                container.childNodes[offset],
                { start: 0, end: 0 },
            );
        }

        const start = isStart
            ? offset
            : (container === range.startContainer ? range.startOffset : 0);

        const end = isStart
            ? (container === range.endContainer ? range.endOffset : undefined)
            : offset;

        return new SelectedElement(
            editableDiv,
            container,
            { start, end },
        );
    }

    private static getFallbackSelection(editableDiv: HTMLDivElement): StoredSelection {
        const firstNode = this.findFirstTextNode(editableDiv) || editableDiv;
        const offset = { start: 0, end: 0 };
        const startElement = new SelectedElement(editableDiv, firstNode, { ...offset });
        const endElement = new SelectedElement(editableDiv, firstNode, { ...offset });
        const commonAncestor = new SelectedElement(editableDiv, firstNode, { ...offset });
        return new StoredSelection(editableDiv, startElement, endElement, commonAncestor);
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