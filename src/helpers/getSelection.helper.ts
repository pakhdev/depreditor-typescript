import { NodeSelection, SelectionDetails } from '../modules/nodes-manager/interfaces/';
import { FormattingName } from '../types';
import { hasStyle } from './hasStyle.helper.ts';
import { toolsConfig } from '../tools.config.ts';

export const getSelection = (editableDiv: HTMLDivElement, extendToInlineParent: boolean): SelectionDetails | null => {
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
        editableDiv,
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

    if (extendToInlineParent) {
        const inlineFormattings: FormattingName[] = toolsConfig
            .filter(tool => !tool.isBlock)
            .map(tool => tool.name);
        const newStartNode = findTopParentWithFormatting(editableDiv, selectionDetails.startNode.node, inlineFormattings);
        if (newStartNode) selectionDetails.startNode.node = newStartNode;
        const newEndNode = findTopParentWithFormatting(editableDiv, selectionDetails.startNode.node, inlineFormattings);
        if (newEndNode) selectionDetails.endNode.node = newEndNode;

        if (newStartNode || newEndNode) {
            const newCommonAncestor = findCommonAncestor(selectionDetails.startNode.node, selectionDetails.endNode.node);
            if (newCommonAncestor) selectionDetails.commonAncestor = newCommonAncestor;
            else console.error('No common ancestor found');
        }
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

export const findTopParentWithFormatting = (editableDiv: HTMLDivElement, node: Node, formattingNames: FormattingName[]): Node | null => {
    let topParent: Node | null = null;
    while (node !== editableDiv) {
        for (const formattingName of formattingNames)
            if (hasStyle(formattingName, node)) topParent = node;
        if (node.parentNode) node = node.parentNode;
        else return null;
    }
    return topParent;
};

const findCommonAncestor = (startNode: Node, endNode: Node): Node | null => {
    let startParent: Node | null = null;
    let endParent: Node | null = null;
    while (true) {
        startParent = startNode.parentNode;
        endParent = endNode.parentNode;
        if (!startParent || !endParent) return null;
        if (startParent.contains(endNode)) return startParent;
        if (endParent.contains(startNode)) return endParent;
    }
};
