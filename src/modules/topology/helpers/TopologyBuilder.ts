import { SelectionManager } from '../../selection-manager/selection-manager.ts';
import { SelectionArgs } from '../interfaces/selection-args.interface.ts';
import { Topology } from '../topology.ts';

export class TopologyBuilder {

    /**
     * Crea una topología. Solo se asigna el nodo y el final de la selección.
     * El resto de propiedades se tiene que asignar fuera de este método.
     */
    static fromNode(node: Node): Topology {
        return new Topology(node);
    }

    /**
     * Crea una topología a partir de una selección.
     * Adicionalmente, se crea y se asigna una topología del nodo padre del nodo común.
     */
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

    /**
     * Clona las propiedades de la topología y todas sus subtopologías.
     * Se clonan los nodos y se sobreescribe la propiedad 'node'
     * Si existiera una topología a preservar, se asignará una topología clonada de la misma.
     */
    static cloneFromTopology(topology: Topology, topologyToPreserve: Topology | null = null, setParent: Topology | null = null): Topology {
        const clonedNode = topology.node.cloneNode();
        const { nodeType } = clonedNode;

        const clonedTopology = this.fromNode(clonedNode);

        if (nodeType === Node.TEXT_NODE && !topology.fullySelected) {
            clonedTopology
                .determineTextSelection({ start: topology.start, end: topology.end })
                .setTopologyToPreserve(topologyToPreserve);
        }

        if (nodeType === Node.ELEMENT_NODE) {
            for (const childTopology of topology.children) {
                const clonedChild = this.cloneFromTopology(
                    childTopology,
                    topologyToPreserve || topology,
                    setParent || clonedTopology,
                );
                clonedTopology.children.push(clonedChild);
                clonedNode.appendChild(clonedChild.node);
            }
        }

        clonedTopology.setParent(topology.parent);
        return clonedTopology;
    }

    private static scanTextNode(topology: Topology, selectionArgs?: SelectionArgs): void {
        if (!selectionArgs) return;
        const { selection } = selectionArgs;
        if (selection.startNode.node === topology.node || selection.endNode.node === topology.node) {
            const selectedNode = selection.startNode.node === topology.node
                ? selection.startNode
                : selection.endNode;
            topology.determineTextSelection({ start: selectedNode.start, end: selectedNode.end });
            if (selectedNode.parentToPreserve)
                topology.setTopologyToPreserve(selectedNode.parentToPreserve);
            selectionArgs.startFound.value = true;
        }
    }

    private static scanElementNode(topology: Topology, selectionArgs?: SelectionArgs): void {
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