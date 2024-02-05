import { EditorInitializer } from './editor-Initializer.ts';
import { FormattingName } from '../types';
import { NodeOrFalse } from '../types/node-or-false.type.ts';

export class NodeInspector {

    constructor(private readonly depreditor: EditorInitializer) {}

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

    // Devuelve los nodos seleccionados completos, aunque no estén completamente seleccionados
    public getAffectedNodes(): Node[] {
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

    public getNodeByIndex(index: number, ancestor: Node): Node | null {
        const childNodes = ancestor.childNodes;
        if (index >= childNodes.length) return null;
        return childNodes[index];
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

    public getNodePath(nodeToFind: Node, parentNode: Node): { path: number[], depth: number } {
        const innerNodes = parentNode.childNodes;

        let path: number[] = [];
        let position = -1;

        for (const innerNode of innerNodes) {
            position++;
            if (innerNode === nodeToFind) {
                path.push(position);
                break;
            }
            if (this.isNodeInAncestor(nodeToFind, innerNode)) {
                path.push(position);
                const findNodeInside = this.getNodePath(nodeToFind, innerNode);
                path = [position, ...findNodeInside.path];
                break;
            }
        }
        return { path, depth: path.length };
    }

    public getNodeByPath(path: number[]): Node | null {
        let node: Node = this.depreditor.editableDiv;
        for (let idx of path) {
            const findNode = this.getNodeByIndex(idx, node);
            if (!findNode) return null;
            node = findNode;
        }
        return node;
    }

    public isNodeEmpty(node: Node): boolean {
        if (node.textContent?.trim() !== '') return false;
        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName.toLowerCase() === 'img')
            return false;

        const childNodes = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];
            if (!this.isNodeEmpty(childNode)) return false;
        }
        return true;
    }

    public findFirstParent(node: Node, commonAncestor: Node): Node {
        let parentNode = node.parentNode;
        while (parentNode && parentNode.parentNode !== commonAncestor) {
            parentNode = parentNode.parentNode;
        }
        return parentNode ?? node;
    }
}