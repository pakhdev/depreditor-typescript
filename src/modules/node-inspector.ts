import { EditorInitializer } from './editor-Initializer.ts';
import { FormattingName } from '../types';
import { toolsConfig } from '../tools.config.ts';
import { NodePath } from '../types/node-path.type.ts';
import { DetailedSelection } from '../types/detailed-selection.type.ts';
import { NodeSelection, NodesSelection } from '../types/nodes-selection.type.ts';
import { NodesArray } from '../types/nodes-array.type.ts';
import { NodesTopology } from '../types/nodes-topology.type.ts';

export class NodeInspector {

    constructor(private readonly depreditor: EditorInitializer) {}

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

    public getSelectedTopology(selection: DetailedSelection, nodes?: Node[], startNodeFound: boolean = false): NodesTopology[] {
        if (!nodes) nodes = this.getAffectedNodes();
        const startNode: Node = selection.startNode.node;
        const endNode: Node = selection.endNode.node;
        const resultTopology: NodesTopology[] = [];

        for (const node of nodes) {
            if (node === startNode) startNodeFound = true;
            if (!startNodeFound && !this.containsNode(node, selection.startNode.node)) continue;
            const children: NodesTopology[] = node.hasChildNodes()
                ? [...this.getSelectedTopology(selection, Array.from(node.childNodes), startNodeFound)]
                : [];
            startNodeFound = true;
            resultTopology.push({ node, children });
            if (node === endNode || this.containsNode(node, selection.endNode.node)) break;
        }
        return resultTopology;
    }

    public isNodeInAncestor(node: Node, ancestor: Node): boolean {
        if (node === ancestor) return true;
        while (node.parentNode && node.parentNode !== ancestor) {
            node = node.parentNode;
        }
        return node.parentNode === ancestor;
    }

    public getContainerIndexInAncestor(node: Node): number {
        const ancestor = node.parentNode;
        if (!ancestor) return -1;
        let index = -1;
        for (const childNode of ancestor.childNodes) {
            index++;
            if (this.containsNode(node, childNode))
                break;
        }
        return index;
    }

    public getNodeByIndex(index: number, ancestor: Node): Node | null {
        const childNodes = ancestor.childNodes;
        if (index >= childNodes.length) return null;
        return childNodes[index];
    }

    public getFirstParentNode(node: Node, parentNode: Node): Node | null {
        if (node === parentNode) return null;
        if (!node.parentNode) return node;
        if (node.parentNode === parentNode) return node;
        return this.getFirstParentNode(node.parentNode, parentNode);
    }

    public getNodePath(nodeToFind: Node, parentNode?: Node): NodePath {
        if (!parentNode) parentNode = nodeToFind.parentNode || this.depreditor.editableDiv;
        if (nodeToFind === this.depreditor.editableDiv) return { path: [], depth: 0 };
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

    public getNodeByPath(path: number[], node?: Node): Node | null {
        if (!node) node = this.depreditor.editableDiv;
        for (let idx of path) {
            const findNode = this.getNodeByIndex(idx, node);
            if (!findNode) return null;
            node = findNode;
        }
        return node;
    }

    public getParentFromGroups(node: Node, groupNames: string[]): { node: Node, formatting: FormattingName } | null {
        const formattingList = toolsConfig.filter(tool => tool.groups && tool.groups.some(group => groupNames.includes(group)));
        while (node !== this.depreditor.editableDiv) {
            const formatting = this.getNodeFormatting(node);
            if (formatting && formattingList.some(tool => tool.name === formatting))
                return { node, formatting };
            node = node.parentNode;
        }
        return null;
    }

    public getParentWithFormatting(node: Node, formattingName: FormattingName): Node | null {
        while (node !== this.depreditor.editableDiv) {
            if (this.hasStyle(formattingName, node)) return node;
            node = node.parentNode;
            if (!node) return null;
        }
        return null;
    }

    public getNodesToFormat(formattingName: FormattingName, selection: DetailedSelection, nodes?: Node[], startNodeFound: boolean = false): {
        nodeSelection: NodeSelection,
        startNodeFound: boolean,
        endNodeFound: boolean,
        skipNodes: number
    } {
        if (!nodes) nodes = this.getAffectedNodes();
        let tempList: NodesArray = [];
        let endNodeFound = false;
        const resultList: NodeSelection[] = [];
        let skipNodes = 0;
        for (const node of nodes) {
            if (node === selection.startNode.node) startNodeFound = true;
            if (this.isOverallFormatting(formattingName, node) && !this.isNodeEmpty(node)) {
                if (tempList.length > 1) resultList.push(this.getSelectedNodesDetails(tempList, selection));
                else resultList.push(...this.getSelectedNodesDetails(tempList, selection));
                tempList = [];
                if (this.containsNode(node, selection.startNode.node)) startNodeFound = true;
                if (this.containsNode(node, selection.endNode.node)) {
                    endNodeFound = true;
                    break;
                }
                skipNodes++;
                continue;
            } else if (this.isBlockNode(node) || this.nodeHasBlockChild(node) || !startNodeFound) {
                resultList.push(...this.getSelectedNodesDetails(tempList, selection));
                tempList = [];
                const childrenInfo = this.getNodesToFormat(formattingName, selection, Array.from(node.childNodes), startNodeFound);
                if (!startNodeFound && childrenInfo.startNodeFound) startNodeFound = true;
                resultList.push(...childrenInfo.nodeSelection);
                tempList = [];
                if (startNodeFound && childrenInfo.endNodeFound) break;
            } else if (node.nodeType === Node.TEXT_NODE && startNodeFound) {
                tempList.push(node);
            } else if (!this.isBlockNode(node) && !this.nodeHasBlockChild(node) && tempList.length !== 0) {
                tempList.push(node);
            } else if (!this.isBlockNode(node) && !this.nodeHasBlockChild(node) && !this.isNodeEmpty(node)) {
                tempList.push(node);
            } else if (startNodeFound) {
                skipNodes++;
            }
            if (node === selection.endNode.node) {
                endNodeFound = true;
                break;
            }
        }

        if (tempList.length > 1) resultList.push(this.getSelectedNodesDetails(tempList, selection));
        else resultList.push(...this.getSelectedNodesDetails(tempList, selection));

        console.log('SELECTED', resultList);

        return {
            nodeSelection: resultList,
            startNodeFound,
            endNodeFound,
            skipNodes,
        };
    }

    public getNodesWithFormatting(formattingName: FormattingName, nodes: Node[]): Node[] {
        const nodesList: Node[] = [];
        for (const node of nodes) {
            if (this.hasStyle(formattingName, node)) nodesList.push(node);
            if (node.hasChildNodes()) {
                const childrenNodes = this.getNodesWithFormatting(formattingName, Array.from(node.childNodes));
                nodesList.push(...childrenNodes);
            }
        }
        return nodesList;
    }

    public isNodeEmpty(node: Node): boolean {
        if (node.textContent?.trim() !== '') return false;
        if (!this.isBlockNode(node) && !this.nodeHasBlockChild(node)) return false;
        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName.toLowerCase() === 'img')
            return false;
        const childNodes = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];
            if (!this.isNodeEmpty(childNode)) return false;
        }
        return true;
    }

    // Devuelve los formatos aplicados a los nodos padres
    public getParentsFormatting(node: Node): FormattingName[] {
        const formatting: FormattingName[] = [];
        let parentNode = node;
        while (parentNode && parentNode !== this.depreditor.editableDiv) {
            const formattingName = this.getNodeFormatting(parentNode);
            if (formattingName !== undefined) formatting.push(formattingName);
            parentNode = parentNode.parentNode;
        }
        return [...new Set(formatting)];
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

    // Devuelve el nombre del formato aplicado a un nodo html
    public getNodeFormatting(node: Node): FormattingName | void {
        if (node.nodeType === Node.TEXT_NODE) return;
        for (const tool of toolsConfig) {
            if (this.hasStyle(tool.name, node))
                return tool.name;
        }
        return;
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

    // Devuelve si todos los nodos hijos tienen el formato
    public isOverallFormatting(formattingName: FormattingName, node: Node | DocumentFragment): boolean {
        if (!(node instanceof DocumentFragment) && this.hasStyle(formattingName, node)) return true;
        if (node.nodeType === Node.TEXT_NODE) return false;
        for (const childNode of node.childNodes) {
            if (!this.isOverallFormatting(formattingName, childNode)) return false;
        }
        return true;
    }

    public hasUnalignedNodes(node: Node, checkParents = true): boolean {

        if (checkParents) {
            const parentsFormatting = this.getParentsFormatting(node);
            if (parentsFormatting.includes('paragraph-left')
                || parentsFormatting.includes('paragraph-center')
                || parentsFormatting.includes('paragraph-right'))
                return false;
        }

        if (node.nodeType === Node.TEXT_NODE) return true;

        const nodeFormatting = this.getNodeFormatting(node);
        if (nodeFormatting
            && ['paragraph-left', 'paragraph-center', 'paragraph-right'].includes(nodeFormatting))
            return false;

        for (const childNode of node.childNodes) {
            if (this.hasUnalignedNodes(childNode)) return true;
        }

        return false;
    }

    public isBlockNode(node: Node): boolean {
        if (node.nodeType === Node.TEXT_NODE) return false;
        if (['img', 'table', 'div'].includes(node.nodeName.toLowerCase())) return true;
        const computedStyle = getComputedStyle(node as Element);
        return computedStyle.display === 'block';
    }

    public nodeHasBlockChild(node: Node): boolean {
        if (!node.hasChildNodes()) return false;
        for (const childNode of node.childNodes) {
            if (this.isBlockNode(childNode)) return true;
        }
        return false;
    }

    public containsNode(parentNode: Node, findNode: Node): boolean {
        if (parentNode === findNode) return true;
        if (!parentNode.hasChildNodes()) return false;
        for (const childNode of parentNode.childNodes) {
            if (this.containsNode(childNode, findNode)) return true;
        }
        return false;
    }

    public getSelectedNodesDetails(nodes: NodesArray, selection: DetailedSelection): NodesSelection {
        const nodesSelection: NodesSelection = [];
        for (const node of nodes) {
            if (Array.isArray(node)) {
                const childrenSelection = this.getSelectedNodesDetails(node, selection);
                nodesSelection.push(childrenSelection);
                continue;
            }
            let fullySelected = false;
            if (selection.startNode.node === node && selection.startNode.fullySelected)
                fullySelected = true;
            if (selection.endNode.node === node && selection.endNode.fullySelected)
                fullySelected = true;
            if (selection.endNode.node !== node && selection.startNode.node !== node)
                fullySelected = true;
            const start = selection.startNode.node === node ? selection.startNode.start : 0;
            const end = selection.endNode.node === node
                ? selection.endNode.end
                : node.textContent?.length || 0;
            nodesSelection.push({ node, fullySelected, start, end });
        }
        return nodesSelection;
    }
}