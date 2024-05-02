import { SelectionManager } from '../../selection-manager/selection-manager.ts';
import { SelectionArgs } from '../interfaces/selection-args.interface.ts';
import { Topology } from '../topology.ts';

export class TopologyBuilder {

    static fromNode(node: Node): Topology {
        return new Topology(node);
    }

    static fromSelection(selection: SelectionManager): Topology {
        const topology = new Topology(selection.commonAncestor);
        const selectionArgs: SelectionArgs = { selection, startFound: { value: false } };
        if (topology.node.nodeType === Node.TEXT_NODE)
            this.scanTextNode(topology, selectionArgs);
        else
            this.scanElementNode(topology, selectionArgs);

        if (topology.length > 0 && topology.parentNode) {
            const parentTopology = new Topology(topology.parentNode).setChildren([topology]);
            topology.setParent(parentTopology);
        }
        return topology;
    }

    static scanTextNode(topology: Topology, selectionArgs?: SelectionArgs): void {
        if (!selectionArgs) return;
        const { selection } = selectionArgs;
        if (selection.startNode.node === topology.node || selection.endNode.node === topology.node) {
            const selectedNode = selection.startNode.node === topology.node
                ? selection.startNode
                : selection.endNode;

            // TODO: Asignar parte del texto seleccionado

            if (selectedNode.parentToPreserve)
                topology.setTopologyToPreserve(selectedNode.parentToPreserve);
            selectionArgs.startFound.value = true;
        }
    }

    static scanElementNode(topology: Topology, selectionArgs?: SelectionArgs): void {
        let startNode: Node | null = null;
        let endNode: Node | null = null;
        let startFound = { value: true };
        if (selectionArgs) {
            const { selection } = selectionArgs;
            startFound = selectionArgs.startFound;
            startNode = selection.startNode.node;
            endNode = selection.endNode.node;
        }
        const children = Array.from(topology.node.childNodes);
        for (const childNode of children) {
            if (!startFound.value && childNode !== startNode && !childNode.contains(startNode))
                continue;
            const childTopology = new Topology(childNode).setParent(topology);
            childTopology.node.nodeType === Node.TEXT_NODE
                ? topology.scanTextNode(selectionArgs)
                : topology.scanElementNode(selectionArgs);
            if (childNode === startNode && childNode.nodeType !== Node.TEXT_NODE)
                startFound.value = true;
            if (selectionArgs?.selection.isRange || childTopology.node !== startNode || childNode.nodeType === Node.TEXT_NODE)
                topology.children.push(topology);
            if (childNode === endNode || childNode.contains(endNode))
                break;
        }
    }
}