import { findNodeByPath } from '../../helpers/nodeRouter.helper.ts';
import { Topology } from '../topology/topology.ts';
import { ContainerProps } from '../../types/container-props.type.ts';
import { SelectionManager } from '../selection-manager/selection-manager.ts';
import { NodeCloningResult } from './node-cloning-result.interface.ts';

export class NodesManager {

    private selectedNodes: Topology | null = null;

    constructor(private readonly editableDiv: HTMLDivElement) {
        return this;
    }

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

    public detachSelectedFragment() {}

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

}