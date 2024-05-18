import { ContainerProps } from '../../types/container-props.type.ts';
import { RangeCloningArgs, NodeCloningResult } from './interfaces';
import { SelectionManager } from '../selection-manager/selection-manager.ts';
import { Topology } from '../topology/topology.ts';
import { TopologyBuilder } from '../topology/helpers/TopologyBuilder.ts';

export class NodesManager {

    private selectedNodes: Topology | null = null;

    constructor(private readonly editableDiv: HTMLDivElement) {
        return this;
    }

    public pickFromSelection(formatting?: ContainerProps): NodesManager {
        const selection = new SelectionManager(this.editableDiv).getSelection();
        if (formatting)
            selection.adjustForFormatting(formatting);
        this.selectedNodes = TopologyBuilder.fromSelection(selection);
        return this;
    }

    public detachSelectedFragment() {
        if (!this.selectedNodes) return;
        const {
            firstSelected: firstTopology,
            lastSelected: lastTopology,
            parentNode,
            node,
        } = this.selectedNodes;
        const rangePositions = Object.values(RangePosition);
        let newSelectedNode: Node | null = null;

        for (const rangePosition of rangePositions) {
            const clonedNode = this.cloneSelectedRange({
                parentTopology: this.selectedNodes,
                firstTopology,
                lastTopology,
                rangePosition,
            });
            parentNode.insertBefore(clonedNode, node);
            if (rangePosition === RangePosition.WITHIN)
                newSelectedNode = clonedNode;
        }
        if (!newSelectedNode)
            throw new Error('No se ha encontrado el nodo clonado para la selección');
        parentNode.removeChild(node);
        this.selectedNodes = TopologyBuilder.fromNode(newSelectedNode, true);
    }

    private removeNodesInDirection(container: Node, target: Node, direction: 'before' | 'after', targetFound = false): boolean {
        if (container === target)
            return true;
        if (container.hasChildNodes()) {
            const childNodes = Array.from(container.childNodes);
            for (const childNode of childNodes) {
                if (targetFound && direction === 'before')
                    break;
                if (targetFound && direction === 'after')
                    container.removeChild(childNode);
                targetFound = this.removeNodesInDirection(childNode, target, direction, targetFound);
                if (!targetFound && direction === 'before')
                    container.removeChild(childNode);
            }
        }
        return targetFound;
    }

    private cloneNode(node: Node, retrieveClonesOf: Node[]): NodeCloningResult {
        const nodeMappings: { originalNode: Node; clonedNode: Node }[] = [];
        const clonedNode = node.cloneNode();
        if (retrieveClonesOf.includes(node))
            nodeMappings.push({ originalNode: node, clonedNode });

        if (node.hasChildNodes()) {
            const children = Array.from(node.childNodes);
            for (const child of children) {
                const cloningResult = this.cloneNode(child, retrieveClonesOf);
                clonedNode.appendChild(cloningResult.clonedNode);
                nodeMappings.push(...cloningResult.nodeMappings);
            }
        }
        return { clonedNode, nodeMappings };
    }

    private cloneSelectedRange(args: RangeCloningArgs): Node {
        const {
            parentTopology: { node: parentNode },
            firstTopology,
            firstTopology: { node: firstNode },
            lastTopology,
            lastTopology: { node: lastNode },
            rangePosition,
        } = args;

        if (!parentNode || !firstNode || !lastNode)
            throw new Error('Error al clonar el rango seleccionado. Al menos uno de los nodos no existe');

        const cloningResult = this.cloneNode(parentNode, [firstNode, lastNode]);
        const firstClonedNode = cloningResult.nodeMappings.find(mapping => mapping.originalNode === firstNode)?.clonedNode;
        const lastClonedNode = cloningResult.nodeMappings.find(mapping => mapping.originalNode === lastNode)?.clonedNode;

        if (!firstClonedNode || !lastClonedNode)
            throw new Error('Error al clonar el rango seleccionado. Al menos uno de los nodos no fue clonado');

        switch (rangePosition) {
            case 'before':
                this.adjustTextContent(firstClonedNode, 0, firstTopology.start);
                this.removeNodesInDirection(cloningResult.clonedNode, firstClonedNode, 'after');
                break;
            case 'within':
                this.adjustTextContent(firstClonedNode, firstTopology.start, firstTopology.end);
                if (firstNode !== lastNode)
                    this.adjustTextContent(lastClonedNode, lastTopology.start, lastTopology.end);
                this.removeNodesInDirection(cloningResult.clonedNode, firstClonedNode, 'before');
                this.removeNodesInDirection(cloningResult.clonedNode, lastClonedNode, 'after');
                break;
            case 'after':
                this.adjustTextContent(lastClonedNode, lastTopology.end, lastTopology.length);
                this.removeNodesInDirection(cloningResult.clonedNode, lastClonedNode, 'before');
                break;
        }

        return cloningResult.clonedNode;
    }

    private adjustTextContent(node: Node, start: number, end: number): void {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent) return;
        node.textContent = node.textContent.slice(start, end);
    }

}