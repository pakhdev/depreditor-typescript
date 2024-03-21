import { findNodeByPath } from '../../helpers/nodeRouter.helper.ts';
import { Topology } from '../topology/topology.ts';
import { ContainerProps } from '../../types/container-props.type.ts';
import { SelectionManager } from '../selection-manager/selection-manager.ts';
import { NodeSplittingArgs } from './interfaces';

export class NodesManager {

    private nodesBackup: Topology | null = null;
    private selectedNodes: Topology | null = null;

    constructor(private readonly editableDiv: HTMLDivElement) {
        return this;
    }

    // ** =========================
    // *  Selección de nodos
    // ** =========================

    public pickFromSelection(formatting: ContainerProps): NodesManager {
        const selection = new SelectionManager(this.editableDiv)
            .adjustForFormatting(formatting);
        if (!selection.isOnEditableDiv) return this;
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

    public detachSelectedFragment(): NodesManager {
        if (!this.selectedNodes?.node) return this;
        let partiallySelectedTopologies = this.selectedNodes.findPartiallySelectedChildren();
        while (partiallySelectedTopologies.length > 0) {
            const topology = partiallySelectedTopologies.shift();
            if (!topology?.node) throw new Error('No se encontró el nodo en la topología');
            const topologyToPreserve = topology.topologyToPreserve || topology;
            this.splitNode({
                parent: topologyToPreserve,
                topology,
                ranges: [topology.start, topology.end],
                partiallySelectedTopologies,
            });
            partiallySelectedTopologies = this.selectedNodes.findPartiallySelectedChildren();
        }
        return this;
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

    private splitNode(nodeSplittingArgs: NodeSplittingArgs): void {
        const { topology, parent, ranges, partiallySelectedTopologies } = nodeSplittingArgs;
        const { node } = topology;
        if (!node || node.nodeType !== Node.TEXT_NODE || !ranges.length)
            throw new Error('No se puede dividir el nodo');

        let clonedTopology: Topology | null = null;
        let idxForTopology = ranges[0] === 0 ? 0 : 1;
        let partIdx = 0;

        const textContent = node.textContent || '';
        const length = textContent.length;
        if (ranges.some(offset => offset > length)) throw new Error('El rango excede la longitud del texto');
        if (!ranges.includes(length)) ranges.push(length);

        const clonedNodes: Node[] = [];
        let start = 0;
        ranges.forEach(end => {
            if (end === 0) return;

            let clonedNode: Node | null = null;
            if (partIdx === idxForTopology) {
                clonedTopology = parent.deepClone(partiallySelectedTopologies);
                clonedNode = clonedTopology.node;
                const topologyToSplit = clonedTopology
                    .findPartiallySelectedChildren()
                    .find(topology => !topology.fullySelected && topology.start === start);
                if (!topologyToSplit) throw new Error('No se encontró la topología a dividir');
                topologyToSplit.setStart(0).setEnd(end - start);

                if (clonedTopology.node instanceof Element && end === length && clonedTopology.end < clonedTopology.length) {
                    const endNodes: Node[] = [];
                    Array.from(parent.node!.childNodes).slice(clonedTopology.end + 1).forEach(node => {
                        endNodes.push(node.cloneNode(true));
                    });
                    clonedTopology.node.append(...endNodes);
                }
            }
            if (!clonedNode) clonedNode = parent.node!.cloneNode(true);

            const target = clonedNode.nodeType === Node.TEXT_NODE
                ? clonedNode
                : this.findEqualNode(node, clonedNode);
            if (!target) throw new Error('No se encontró el nodo clonado');

            target.textContent = textContent.substring(start, end);
            if (start !== 0) this.removeNodesInDirection(target, 'before');
            if (end !== length) this.removeNodesInDirection(target, 'after');
            clonedNodes.push(clonedNode);

            partIdx++;
            start = end;
        });

        parent.node!.parentNode!.replaceChild(this.makeFragment(clonedNodes), parent.node!);
        if (clonedTopology) this.selectedNodes === parent
            ? this.selectedNodes = clonedTopology
            : parent.replaceWith(clonedTopology);
    }

    private removeNodesInDirection(target: Node, direction: 'before' | 'after'): void {
        let container: Node | null = target;
        while (container) {
            const childNodes = Array.from(container.childNodes);
            let nodeFound = false;
            for (let node of childNodes) {
                if (node.contains(target)) {
                    nodeFound = true;
                    if (direction === 'before') break;
                    if (direction === 'after') continue;
                }
                if (direction === 'before' || nodeFound) {
                    container.removeChild(node);
                }
            }
            container = container.parentNode;
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