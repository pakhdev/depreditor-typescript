import { SelectionManager } from '../../selection-manager/selection-manager.ts';
import { SelectionArgs } from '../interfaces/selection-args.interface.ts';
import { Topology } from '../topology.ts';

export class TopologyBuilder {

    /**
     * Crea una topología. Solo se asigna el nodo y el final de la selección.
     * El resto de propiedades se tiene que asignar fuera de este método.
     */
    static fromNode(node: Node, scanChildNodes = false): Topology {
        const topology = new Topology(node);
        if (scanChildNodes)
            this.scanChildNodes(topology);
        return topology;
    }

    /**
     * Crea una topología a partir de una selección.
     * Adicionalmente, se crea y se asigna una topología del nodo padre del nodo común.
     */
    static fromSelection(selection: SelectionManager): Topology {
        const topology = new Topology(selection.commonAncestorNode);
        const selectionArgs: SelectionArgs = { selection, startFound: { value: false } };
        this.scanChildNodes(topology, selectionArgs);
        return topology;
    }

    /**
     * Clona las propiedades de la topología y todas sus subtopologías.
     * Se clonan los nodos y se sobreescribe la propiedad 'node'
     * Si existiera una topología a preservar, se asignará una topología clonada de la misma.
     */
    static cloneFromTopology(topology: Topology, setParent: Topology | null = null): Topology {
        const clonedNode = topology.node.cloneNode();
        const { nodeType } = clonedNode;

        const clonedTopology = this.fromNode(clonedNode);

        if (nodeType === Node.TEXT_NODE && !topology.fullySelected)
            clonedTopology.determineTextSelection({ start: topology.start, end: topology.end });

        if (nodeType === Node.ELEMENT_NODE) {
            for (const childTopology of topology.children) {
                const clonedChild = this.cloneFromTopology(
                    childTopology,
                    setParent || clonedTopology,
                );
                clonedTopology.children.push(clonedChild);
                clonedNode.appendChild(clonedChild.node);
            }
        }

        return clonedTopology
            .setParent(setParent)
            .setOwnerEditor(topology.ownerEditor);
    }

    private static scanChildNodes(topology: Topology, selectionArgs?: SelectionArgs): void {
        if (topology.node.nodeType === Node.TEXT_NODE)
            this.scanTextNode(topology, selectionArgs);
        else
            this.scanElementNode(topology, selectionArgs);

        if (topology.length > 0 && topology.parentNode) {
            const parentTopology = new Topology(topology.parentNode).setChildren([topology]);
            topology.setParent(parentTopology);
        }
    }

    private static scanTextNode(topology: Topology, selectionArgs?: SelectionArgs): void {
        if (!selectionArgs) return;
        const { selection } = selectionArgs;
        const { startSelectionNode, endSelectionNode } = selection;

        if (startSelectionNode.node === topology.node || endSelectionNode.node === topology.node) {
            const selectedNode = startSelectionNode.node === topology.node
                ? startSelectionNode
                : endSelectionNode;
            topology.determineTextSelection({ start: selectedNode.start, end: selectedNode.end });
            selectionArgs.startFound.value = true;
        }
    }

    private static scanElementNode(topology: Topology, selectionArgs?: SelectionArgs): void {
        let startNode: Node | null = null;
        let endNode: Node | null = null;
        let startFound = { value: true };
        if (selectionArgs) {
            const { selection } = selectionArgs;
            startNode = selection.startSelectionNode.node;
            endNode = selection.endSelectionNode.node;
            startFound = selectionArgs.startFound;
        }
        const children = Array.from(topology.node.childNodes);
        for (const childNode of children) {
            if (!startFound.value && childNode !== startNode && !childNode.contains(startNode))
                continue;
            const childTopology = new Topology(childNode).setParent(topology);
            childTopology.node.nodeType === Node.TEXT_NODE
                ? this.scanTextNode(topology, selectionArgs)
                : this.scanElementNode(topology, selectionArgs);
            if (childNode === startNode && childNode.nodeType !== Node.TEXT_NODE)
                startFound.value = true;
            if (selectionArgs?.selection.isRange || childTopology.node !== startNode || childNode.nodeType === Node.TEXT_NODE)
                topology.children.push(topology);
            if (childNode === endNode || childNode.contains(endNode))
                break;
        }
    }
}