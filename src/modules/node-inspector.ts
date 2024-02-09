import { EditorInitializer } from './editor-Initializer.ts';
import { FormattingName } from '../types';
import { NodeOrFalse } from '../types/node-or-false.type.ts';
import { toolsConfig } from '../tools.config.ts';

export class NodeInspector {

    constructor(private readonly depreditor: EditorInitializer) {}

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
        const selection = this.depreditor.caret.inspectSelection();
        if (!selection) return [];
        const nodes: Node[] = [];

        const range = selection.range;
        const commonAncestor = range.commonAncestorContainer;
        const startContainer = selection.startNode.node;
        const endContainer = selection.endNode.node;

        if (startContainer === endContainer) return [startContainer];

        let startContainerFound = false;
        for (const node of commonAncestor.childNodes) {

            if (!startContainerFound && this.isNodeInAncestor(startContainer, node))
                startContainerFound = true;

            if (startContainerFound) nodes.push(node);

            if (this.isNodeInAncestor(endContainer, node)) break;
        }

        return nodes;
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

    public getDifferenceMap(originalChildNodes: Node[], copyChildNodes: Node[]): NodeOrFalse[] {
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
                const childNodesMapping = this.getDifferenceMap(Array.from(originalChild.childNodes), Array.from(copyChild.childNodes));
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
        if (nodeToFind === parentNode) return { path: [], depth: 0 };
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

    // Devuelve el nombre del formato aplicado a un nodo html
    public getNodeFormatting(node: Node): FormattingName | void {
        if (node.nodeType === Node.TEXT_NODE) return;
        for (const tool of toolsConfig) {
            if (this.hasStyle(tool.name, node))
                return tool.name;
        }
        return;
    }

    // Devuelve los estilos de los nodos hijos
    public getNodeChildrenFormatting(node: Node): FormattingName[] {
        const formatting: FormattingName[] = [];
        for (const childNode of node.childNodes) {
            const formattingName = this.getNodeFormatting(childNode);
            if (formattingName) formatting.push(formattingName);
            if (childNode.childNodes.length > 0) {
                const childrenFormatting = this.getNodeChildrenFormatting(childNode);
                formatting.push(...childrenFormatting);
            }
        }
        return formatting;
    }

    // Devuelve si el nodo sirve para aplicar un formato
    public hasStyle(formattingName: FormattingName, node: Node): boolean {
        if (node.nodeType === Node.TEXT_NODE) return false;
        const element = node as HTMLElement;
        const tool = toolsConfig.find(tool => tool.name === formattingName);
        if (!tool) return false;

        if (element.tagName.toLowerCase() !== tool.tag) return false;
        if (tool.classes) {
            for (const className of tool.classes) {
                if (!element.classList.contains(className))
                    return false;
            }
        }
        if (tool.styles) {
            for (const styleName in tool.styles) {
                if (!element.style[styleName])
                    return false;

                if (tool.styles[styleName] !== '' && element.style[styleName] !== tool.styles[styleName])
                    return false;
            }
        }
        if (tool.attributes) {
            for (const attributeName in tool.attributes) {
                if (!element.hasAttribute(attributeName))
                    return false;
                if (tool.attributes[attributeName] !== '' && element.getAttribute(attributeName) !== tool.attributes[attributeName])
                    return false;
            }
        }
        return true;
    }

}