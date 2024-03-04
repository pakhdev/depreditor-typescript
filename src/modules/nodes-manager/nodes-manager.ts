import { NodesTopology, SelectionDetails, SelectionPickArgs } from './interfaces';
import { getSelection } from '../../helpers/getSelection.helper.ts';

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
    // *  Modificación de nodos
    // ** =========================

    public detachSelectedFragment(): void {}

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

    // ** =========================
    // *  Retorno de datos
    // ** =========================

    public getBackup(): void {}

    public getNodes(): void {}

    public getPreviousNode(): void {}

    public getNextNode(): void {}

    public getFormattingList(): void {}

}