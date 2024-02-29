import { NodeSelection, SelectionDetails } from '../modules/nodes-manager/interfaces/';

export const getSelection = (editableDiv: HTMLDivElement): SelectionDetails | null => {
    const selection = window.getSelection();
    if (!selection || !selection.focusNode || !editableDiv.contains(selection.anchorNode))
        return null;
    const range = selection.getRangeAt(0);

    const startNode: Node = range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer
        : range.startContainer.childNodes[range.startOffset];
    const endNode = range.endContainer.nodeType === Node.TEXT_NODE
        ? range.endContainer
        : range.endContainer.childNodes[range.endOffset - 1];
    const sameNode = startNode === endNode;

    const selectionDetails = {
        isRange: !range.collapsed,
        sameNode,
        commonAncestor: range.commonAncestorContainer,
        startNode: prepareSelection(startNode),
        endNode: prepareSelection(endNode),
    };

    if (startNode.nodeType === Node.TEXT_NODE) {
        const { startOffset, endOffset } = range;
        const { length } = startNode as Text;
        const endSelected = !sameNode || endOffset === length;
        selectionDetails.startNode = {
            start: startOffset,
            end: range.startContainer !== range.endContainer ? length : endOffset,
            startSelected: startOffset === 0,
            endSelected,
            fullySelected: startOffset === 0 && endSelected,
            node: startNode,
            length,
        };
    }

    if (endNode.nodeType === Node.TEXT_NODE) {
        const { startOffset, endOffset } = range;
        const { length } = endNode as Text;
        selectionDetails.endNode = {
            start: !sameNode ? 0 : startOffset,
            end: endOffset,
            startSelected: !sameNode || startOffset === 0,
            endSelected: endOffset === length,
            fullySelected: startOffset === 0 && endOffset === length,
            node: endNode,
            length,
        };
    }

    return selectionDetails;
};

const prepareSelection = (node: Node): NodeSelection => {
    const isTextNode = node.nodeType === Node.TEXT_NODE;
    return {
        node,
        fullySelected: !isTextNode,
        startSelected: !isTextNode,
        endSelected: !isTextNode,
        start: 0,
        end: 0,
        length: node.textContent?.length || 0,
    };
};
