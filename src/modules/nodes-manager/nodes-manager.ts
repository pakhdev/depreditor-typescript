import { getSelection } from '../../helpers/getSelection.helper.ts';
import { findNodeByPath } from '../../helpers/nodeRouter.helper.ts';
import { Topology } from '../topology/topology.ts';

export class NodesManager {

    private nodesBackup: Topology | null = null;
    private selectedNodes: Topology | null = null;

    constructor(private readonly editableDiv: HTMLDivElement) {}

    // ** =========================
    // *  Selección de nodos
    // ** =========================

    public pickFromSelection(forBlockElement: boolean): NodesManager {
        const selection = getSelection(this.editableDiv, forBlockElement);
        if (!selection) return this;
        this.selectedNodes = new Topology().fromSelection(selection);
        return this;
    }

    public pickFromPath(path: number[]): void {
        const node = findNodeByPath(path, this.editableDiv);
        if (node) this.selectedNodes = new Topology().fromNode(node);
    }

    // ** =========================
    // *  Creación de Backup
    // ** =========================

    public makeBackup(activate: boolean): NodesManager {
        if (!activate || !this.selectedNodes) return this;
        this.nodesBackup = { ...this.selectedNodes } as Topology;
        this.nodesBackup.children.map(child => new Topology()
            .fromNode(child.node!.cloneNode(true))
            .setPath(child.path)
            .setParent(this.nodesBackup!));
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

    public detachSelectedFragment(isBlock: boolean, topology: Topology | null = this.selectedNodes): void {
        if (!topology || !topology.node) return;
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