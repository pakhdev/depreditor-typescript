import { findNodeByPath, getNodePosition } from '../../helpers/nodeRouter.helper.ts';
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

    public pickFromSelection(formatting?: ContainerProps): NodesManager {
        const selection = new SelectionManager(this.editableDiv);
        if (formatting) selection.adjustForFormatting(formatting);
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

            if (topology.start === topology.end) {
                const nodePosition = getNodePosition(topology.node!, topology.node!.parentNode!);
                const newPosition = topology.start === 0 ? nodePosition : nodePosition + 1;
                if (!topology.parent) {
                    const parent = new Topology().fromNode(topology.node!.parentNode!);
                    topology.setParent(parent);
                    this.selectedNodes = parent;
                } else {
                    topology.parent.removeChild(topology);
                }
                topology.parent!.setStart(newPosition).setEnd(newPosition);
                if ([0, topology.length].includes(topology.start)) continue;
            }

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

    public insertNodes(fragment: DocumentFragment | Node): void {
        if (typeof this.selectedNodes !== 'object' || this.selectedNodes === null) return;
    }

    public removeNodes(offset: number, limit: number): void {
        if (typeof this.selectedNodes !== 'object' || this.selectedNodes === null)
            return;
    }

    public insertText(text: string): void {
        if (typeof this.selectedNodes !== 'object' || this.selectedNodes === null)
            return;
        if (this.selectedNodes.node!.nodeType === Node.TEXT_NODE) {
            // Insert at offset
        } else {
            const textNode = document.createTextNode(text);
            const textFragment = this.makeFragment(textNode);
            this.insertNodes(textFragment);
        }

        // else if (this.selectedNodes.children.length === 1 && this.selectedNodes.children[0].node!.nodeName === 'BR') {
        //     // Create text node and insert before BR insertNodes
        // } else if (this.selectedNodes.children.length === 0) {
        //     // Create text node and append to node insertNodes
        // } else {
        //     // Create text node and replace nodes insertNodes
        // }
    }

    public removeText(offset: number, limit: number): void {
        if (typeof this.selectedNodes !== 'object' || this.selectedNodes === null)
            return;
    }

    private splitNode(nodeSplittingArgs: NodeSplittingArgs): void {
        const { topology, parent, ranges, partiallySelectedTopologies } = nodeSplittingArgs;
        const { node } = topology;

        if (!node || node.nodeType !== Node.TEXT_NODE || ranges.length === 0)
            throw new Error('Cannot split the node');

        const textContent = node.textContent || '';
        const textLength = textContent.length;
        if (ranges.some(offset => offset > textLength))
            throw new Error('Range exceeds the text length');
        if (!ranges.includes(textLength)) ranges.push(textLength);

        const uniqueRanges = [...new Set(ranges)];
        const isMultipleRanges = uniqueRanges.length > 1;
        const topologyCloneIndex = !isMultipleRanges ? -1 : (uniqueRanges[0] === 0 ? 0 : 1);
        const clonedNodes: Node[] = [];

        uniqueRanges.reduce((start, end) => {
            if (end === 0 || start === end) return end;

            if (clonedNodes.length === topologyCloneIndex) {
                const clonedTopology = parent.deepClone(partiallySelectedTopologies, [], topologyCloneIndex);
                if (clonedTopology.node instanceof Element && end === textLength && parent.end < clonedTopology.length) {
                    const remainingNodes = Array.from(parent.node!.childNodes).slice(parent.end + 1);
                    clonedTopology.node.append(...remainingNodes.map(node => node.cloneNode(true)));
                }
                clonedNodes.push(clonedTopology.node!);
                this.selectedNodes === parent ? this.selectedNodes = clonedTopology : parent.replaceWith(clonedTopology);
            } else {
                const clonedParentNode = parent.node!.cloneNode(true);
                const targetNode = clonedParentNode.nodeType === Node.TEXT_NODE ? clonedParentNode : this.findEqualNode(node, clonedParentNode);
                if (!targetNode) throw new Error('Cloned node not found');

                targetNode.textContent = textContent.substring(start, end);
                if (start !== 0) this.removeNodesInDirection(targetNode, 'before');
                if (end !== textLength) this.removeNodesInDirection(targetNode, 'after');
                clonedNodes.push(clonedParentNode);
            }

            return end;
        }, 0);

        let parentNodeToUpdate = parent.parent?.node || parent.node!.parentNode;
        let nodeToReplace = parent.parent ? node : parent.node!;

        parentNodeToUpdate!.replaceChild(this.makeFragment(clonedNodes), nodeToReplace);
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

    public getNodes(): Topology | null {
        return this.selectedNodes;
    }

    public getPreviousNode(): void {}

    public getNextNode(): void {}

    public getFormattingList(): void {}

}