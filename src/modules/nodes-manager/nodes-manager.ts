import { NodesTopology, SelectionDetails, SelectionPickArgs } from './interfaces';

export class NodesManager {

    private nodesBackup: Node[] = [];
    private selectedNodes: Node[] | Node | null = null;

    constructor(private readonly editableDiv: HTMLDivElement) {}

    // ** =========================
    // *  Selección de nodos
    // ** =========================

    public pickFromSelection(options: SelectionPickArgs): void {
        if (!options.selection) return;
        let topology: NodesTopology = {
            node: options.node || options.selection.commonAncestor,
            path: options.path || this.getNodePath(options.selection.commonAncestor)!,
            children: [],
            start: 0,
            end: 0,
            length: 0,
        };
        this.selectedNodes = topology.node.nodeType === Node.TEXT_NODE
            ? this.getTopologyOfTextNode(topology, options)
            : this.getTopologyOfElementNode(topology, options);
    }

    public pickFromPath(path: number[]): void {
        const node = this.findNodeByPath(path);
        if (node) this.selectedNodes = node;
    }

    // ** =========================
    // *  Creación de Backup
    // ** =========================

    public makeBackup(activate: boolean): void {
        if (!activate) return;
        // Взять все ноды первого уровня
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

    private getTopologyOfTextNode(topology: NodesTopology, options: SelectionPickArgs): NodesTopology {
        if (options.selection.startNode.node === topology.node) {
            return {
                ...options.selection.startNode,
                children: topology.children,
                path: topology.path,
            };
        } else if (options.selection.endNode.node === topology.node) {
            return {
                ...options.selection.endNode,
                children: topology.children,
                path: topology.path,
            };
        }
        topology.start = 0;
        topology.end = topology.node.textContent!.length - 1;
        topology.fullySelected = true;
        topology.startSelected = true;
        topology.endSelected = true;
        return topology;
    }

    private getTopologyOfElementNode(topology: NodesTopology, options: SelectionPickArgs): NodesTopology {
        return topology;
    }

    // ** =========================
    // *  Modificación de nodos
    // ** =========================

    public detachSelectedFragment(): void {}

    public applyFormat(): void {}

    public removeFormat(): void {}

    public insertNodes(): void {}

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