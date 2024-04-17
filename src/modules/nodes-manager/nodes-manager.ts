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

    private splitNode() {}

    private removeNodesInDirection() {}

    private cloneNode(node: Node, retrieveCloneOf: Node): NodeCloningResult {
        const clonedNode = node.cloneNode();
        let retrievedNode: Node | null = node === retrieveCloneOf ? clonedNode : null;

        if (node.hasChildNodes()) {
            const children = Array.from(node.childNodes);
            for (const child of children) {
                const cloningResult = this.cloneNode(child, retrieveCloneOf);
                clonedNode.appendChild(cloningResult.clonedNode);
                if (cloningResult.retrievedNode)
                    retrievedNode = cloningResult.clonedNode;
            }
        }
        return { clonedNode, retrievedNode };
    }

}