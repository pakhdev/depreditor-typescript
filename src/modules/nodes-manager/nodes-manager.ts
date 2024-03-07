import { NodesTopology, SelectionDetails, SelectionPickArgs } from './interfaces';
import { getSelection } from '../../helpers/getSelection.helper.ts';
import { toolsConfig } from '../../tools.config.ts';
import { FormattingName } from '../../types';

export class NodesManager {

    private nodesBackup: NodesTopology | null = null;
    private selectedNodes: NodesTopology | null = null;

    constructor(private readonly editableDiv: HTMLDivElement) {}

    // ** =========================
    // *  Selección de nodos
    // ** =========================

    public pickFromSelection(): NodesManager {
        const selection = getSelection(this.editableDiv);
        if (!selection) return this;
        const commonAncestor = selection.commonAncestor;
        const options: SelectionPickArgs = { selection };
        this.selectedNodes = commonAncestor.nodeType === Node.TEXT_NODE
            ? this.getTopologyOfTextNode(commonAncestor, options)
            : this.getTopologyOfElementNode(commonAncestor, options);
        return this;
    }

    public pickFromPath(path: number[]): void {
        const node = this.findNodeByPath(path);
        if (node) this.selectedNodes = node;
    }

    // ** =========================
    // *  Creación de Backup
    // ** =========================

    public makeBackup(activate: boolean): NodesManager {
        if (!activate || !this.selectedNodes) return this;
        this.nodesBackup = { ...this.selectedNodes };
        this.nodesBackup.children.map(child => {
            const topology = this.createTopology(child.node, child.path);
            child.node = child.node.cloneNode(true);
            child.end = topology.length;
            child.startSelected = true;
            child.endSelected = true;
            child.fullySelected = true;
        });
        console.log(this.nodesBackup);
        return this;
    }

    // ** =========================
    // *  Filtración de nodos
    // ** =========================

    public filterSelectedNodes(): void {}

    public filterFormattedNodes(): void {}

    public filterUnformattedNodes(): void {}

    // ** =========================
    // *  Utilidades de ruta de nodos
    // ** =========================

    private findNodeByPath(path: number[]): Node | null {
        let parent: Node | null = this.editableDiv;
        for (const idx of path) {
            if (!parent || parent.nodeType !== Node.ELEMENT_NODE) return null;
            parent = parent.childNodes[idx] ?? null;
        }
        return parent;
    }

    private findNodeByIndex(parent: Node, idx: number): Node | null {
        return parent.childNodes.item(idx) ?? null;
    }

    private getNodePath(nodeToFind: Node, parent: Node = this.editableDiv): number[] | null {
        if (nodeToFind === parent) return [];
        const innerNodes = parent.childNodes;
        for (let i = 0; i < innerNodes.length; i++) {
            if (innerNodes[i] === nodeToFind) return [i];
            if (innerNodes[i].nodeType === Node.ELEMENT_NODE && innerNodes[i].contains(nodeToFind)) {
                const childPath = this.getNodePath(nodeToFind, innerNodes[i]);
                return childPath !== null ? [i, ...childPath] : null;
            }
        }
        return null;
    }

    private createTopology(node: Node, path?: number[]): NodesTopology {
        return {
            node,
            path: path || this.getNodePath(node)!,
            children: [],
            start: 0,
            end: 0,
            length: node.nodeType === Node.TEXT_NODE
                ? node.textContent!.length
                : node.childNodes.length,
        };
    }

    private getTopologyOfTextNode(node: Node, options: SelectionPickArgs): NodesTopology {
        const topology = this.createTopology(node, options.path);
        if (options.selection.startNode.node === topology.node || options.selection.endNode.node === topology.node) {
            const selectedNode = options.selection.startNode.node === topology.node
                ? options.selection.startNode
                : options.selection.endNode;
            return {
                ...selectedNode,
                children: topology.children,
                path: topology.path,
            };
        }
        return {
            ...topology,
            startSelected: true,
            endSelected: true,
            fullySelected: true,
        };
    }

    private getTopologyOfElementNode(node: Node, options: SelectionPickArgs): NodesTopology {
        const topology = this.createTopology(node, options.path);
        const children = Array.from(topology.node.childNodes);
        const startNode: Node = options.selection.startNode.node;
        const endNode: Node = options.selection.endNode.node;

        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            if (!options.startFound && node !== startNode && !node.contains(startNode)) continue;
            if (!options.startFound) topology.start = i;
            options.path = [...topology.path, i];
            const childTopology = node.nodeType === Node.TEXT_NODE
                ? this.getTopologyOfTextNode(node, options)
                : this.getTopologyOfElementNode(node, options);
            if (node === startNode) {
                options.startFound = true;
                topology.start = i;
            }
            topology.children.push(childTopology);
            if (node === endNode || node.contains(endNode)) {
                topology.end = i;
                break;
            }
        }
        return {
            ...topology,
            startSelected: topology.start === 0,
            endSelected: !children.length || topology.end === topology.children.length - 1,
            fullySelected: children.length === topology.children.length,
        };
    }

    // ** =========================
    // *  Utilidades de búsqueda de nodos
    // ** =========================

    private findEqualNode(node: Node, parent: Node = this.editableDiv): Node | null {
        if (parent.isEqualNode(node)) return parent;
        const children = Array.from(parent.childNodes);
        for (let child of children) {
            if (child.isEqualNode(node)) return child;
            if (child.nodeType === Node.ELEMENT_NODE) {
                const found = this.findEqualNode(node, child);
                if (found) return found;
            }
        }
        return null;
    }

    // ** =========================
    // *  Otras utilidades
    // ** =========================

    private makeFragment(node: Node | Node[]): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const nodesList: Node[] = [];
        let sourceNodes: Node[] = [];

        if (Array.isArray(node)) {
            sourceNodes.push(...node);
        } else if (node.hasChildNodes()) {
            sourceNodes.push(...Array.from(node.childNodes));
        }

        for (const childNode of sourceNodes) {
            nodesList.push(childNode);
        }
        fragment.append(...nodesList);
        return fragment;
    }

    // ** =========================
    // *  Modificación de nodos
    // ** =========================

    public detachSelectedFragment(isBlock: boolean, topology: NodesTopology | null = this.selectedNodes): void {
        if (!topology) return;
        if (topology.node.nodeType === Node.TEXT_NODE && !topology.fullySelected) {
            const splittedNodes = this.splitNode(topology.node, topology.node, [topology.start, topology.end]);
            const newFragment = this.makeFragment(splittedNodes);
            // TODO: Insertar antes o después del nodo
            topology.node.parentNode!.removeChild(topology.node);

        }
        for (let child of topology.children)
            this.detachSelectedFragment(isBlock, child);
    }

    public applyFormat(): void {}

    public removeFormat(): void {}

    public insertNodes(offset: number, fragment: DocumentFragment | Node): void {
        if (typeof this.selectedNodes !== 'object' || this.selectedNodes === null) return;
        const referenceNode = this.selectedNodes.node.childNodes[offset + 1];
        this.selectedNodes.node.insertBefore(fragment, referenceNode);
    }

    public removeNodes(offset: number, limit: number): void {
        if (typeof this.selectedNodes !== 'object' || this.selectedNodes === null)
            return;
    }

    public insertText(offset: number, text: string): void {
        if (typeof this.selectedNodes !== 'object' || this.selectedNodes === null)
            return;
    }

    public removeText(offset: number, limit: number): void {
        if (typeof this.selectedNodes !== 'object' || this.selectedNodes === null)
            return;
    }

    private splitNode(parent: Node, node: Node, ranges: number[]): Node[] {
        if (node.nodeType !== Node.TEXT_NODE || ranges.length === 0) return [node.cloneNode(true)];
        const textContent = node.textContent || '';
        const length = textContent.length;
        if (ranges.some(offset => offset > length)) return [node.cloneNode(true)];
        if (!ranges.includes(length)) ranges.push(length);

        const clonedNodes: Node[] = [];
        let start = 0;
        ranges.forEach(offset => {
            const end = offset;
            if (end === 0) return;
            const clonedNode = parent.cloneNode(true);
            const target = clonedNode.nodeType === Node.TEXT_NODE
                ? clonedNode
                : this.findEqualNode(node, clonedNode);
            if (!target) return;
            target.textContent = textContent.substring(start, end);
            if (start !== 0) this.removeNodesInDirection(parent, target, 'before');
            if (end !== length) this.removeNodesInDirection(parent, target, 'after');
            clonedNodes.push(clonedNode);
            start = end;
        });
        return clonedNodes;
    }

    private removeNodesInDirection(parent: Node, target: Node, direction: 'before' | 'after'): void {
        let container = target;
        while (container !== parent) {
            if (container.parentNode) container = container.parentNode;
            else return;
            const childNodes = Array.from(container.childNodes);
            let nodeFound = false;
            for (let node of childNodes) {
                if (node.contains(target)) {
                    nodeFound = true;
                    if (direction === 'before') break;
                    if (direction === 'after') continue;
                }
                if (direction === 'before' || nodeFound) container.removeChild(node);
            }
        }
    }

    // ** =========================
    // *  Retorno de datos
    // ** =========================

    public getBackup(): void {}

    public getNodes(): void {}

    public getPreviousNode(): void {}

    public getNextNode(): void {}

    public getFormattingList(): void {}

}