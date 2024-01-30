import { EditorInitializer } from './editor-Initializer.ts';
import { FormattingName } from '../types';
import { NodeOrFalse } from '../types/node-or-false.type.ts';

export class NodeInspector {

    constructor(private readonly depreditor: EditorInitializer) {

    }

    getCurrent() {
        const currentSelection = this.depreditor.caret.getSelection();
        if (!currentSelection) return null;
        return currentSelection.focusNode;
    }

    getAlignment(): string | null {
        const alignmentNames: FormattingName[] = ['justifyleft', 'justifycenter', 'justifyright'];
        for (const alignmentName of alignmentNames) {
            if (document.queryCommandState(alignmentName)) return alignmentName;
        }
        return null;
    }

    getForeColor(): string | null {
        return document.queryCommandValue('foreColor');
    }

    getBackgroundColor(): string | null {
        return document.queryCommandValue('backColor');
    }

    isEmpty(node: Node): boolean {
        const childElements = node.childNodes;
        if (childElements.length === 0) return true;
        return childElements.length === 1 && node.firstChild?.nodeName.toLowerCase() === 'br';
    }

    // Devuelve los nodos seleccionados completos, aunque no estén completamente seleccionados
    public getSelectedNodes(): Node[] {
        const selection = window.getSelection();
        const nodes: Node[] = [];

        if (selection) {
            const range = selection.getRangeAt(0);
            const commonAncestor = range.commonAncestorContainer;
            const { startContainer, endContainer } = range;

            let startContainerFound = false;
            for (const node of commonAncestor.childNodes) {

                if (!startContainerFound && this.isNodeInAncestor(startContainer, node))
                    startContainerFound = true;

                if (startContainerFound) nodes.push(node);

                if (this.isNodeInAncestor(endContainer, node)) break;
            }
        }
        return nodes;
    }

    // Devuelve los nodos seleccionados completos, pero solo con el contenido seleccionado
    public getSelectedFragment(): Node[] {
        const selection = window.getSelection();
        if (!selection) return [];
        const range = selection.getRangeAt(0);
        const fragment = range.cloneContents();
        return Array.from(fragment.childNodes);
    }

    public isNodeInAncestor(node: Node, ancestor: Node): boolean {
        if (node === ancestor) return true;
        while (node.parentNode && node.parentNode !== ancestor) {
            node = node.parentNode;
        }
        return node.parentNode === ancestor;
    }

    public getContainerIndexInAncestor(node: Node, ancestor: Node): number {
        let index = -1;
        for (const childNode of ancestor.childNodes) {
            index++;
            if (this.isNodeInAncestor(node, childNode))
                break;
        }
        return index;
    }

    public getNodeByIndexInAncestor(index: number, ancestor: Node): Node | null {
        let currentIndex = -1;
        for (const childNode of ancestor.childNodes) {
            currentIndex++;
            if (currentIndex === index) return childNode;
        }
        return null;
    }

    public compareChildNodes(originalChildNodes: Node[], copyChildNodes: Node[]): NodeOrFalse[] {
        const nodesMapping: NodeOrFalse[] = [];
        for (let i = 0; i < originalChildNodes.length; i++) {

            const originalChild = originalChildNodes[i];
            const copyChild = copyChildNodes[i];

            if (!copyChild) {
                nodesMapping.push(originalChild.cloneNode(true));
                continue;
            }

            if (originalChild.isEqualNode(copyChild)) {
                nodesMapping.push(false);
            } else if (originalChild.childNodes.length) {
                const childNodesMapping = this.compareChildNodes(Array.from(originalChild.childNodes), Array.from(copyChild.childNodes));
                childNodesMapping.length === originalChild.childNodes.length
                    ? nodesMapping.push(originalChild.cloneNode(true))
                    : nodesMapping.push(childNodesMapping);
            } else {
                nodesMapping.push(originalChild.cloneNode(true));
            }
        }
        return nodesMapping;
    }
}