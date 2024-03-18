import { getNodePath } from '../../helpers/nodeRouter.helper.ts';
import { SelectionArgs } from './interfaces/selection-args.interface.ts';
import { NodeSelection } from '../selection-manager/node-selection.ts';
import { SelectionManager } from '../selection-manager/selection-manager.ts';

export class Topology extends NodeSelection {

    public path: number[] = [];
    public children: Topology[] = [];
    public parent: Topology | null = null;
    public topologyToPreserve: Topology | null = null;

    public fromNode(node: Node): Topology {
        this.node = node;
        this.parentToPreserve = node.parentNode;
        this.length = node.nodeType === Node.TEXT_NODE
            ? node.textContent!.length
            : node.childNodes.length;
        this.end = this.length ? this.length : 0;
        return this;
    }

    public fromSelection(selection: SelectionManager): Topology {
        const ancestorPath = getNodePath(selection.commonAncestor, selection.editableDiv);
        if (!ancestorPath) throw new Error('No se encontró el ancestro común');
        this.fromNode(selection.commonAncestor).setPath(ancestorPath);
        const selectionArgs: SelectionArgs = { selection, startFound: { value: false } };
        if (this.node!.nodeType === Node.TEXT_NODE) this.scanTextNode(selectionArgs);
        else this.scanElementNode(selectionArgs);
        return this;
    }

    public setNode(node: Node): Topology {
        this.node = node;
        return this;
    }

    public setPath(path: number[]): Topology {
        this.path = path;
        return this;
    }

    public setParent(parent: Topology): Topology {
        this.parent = parent;
        return this;
    }

    public setChildren(children: Topology[]): Topology {
        this.children = children;
        return this;
    }

    public setTopologyToPreserve(parentToPreserve: Node | Topology): Topology {
        this.topologyToPreserve = parentToPreserve instanceof Node
            ? this.findByNode(parentToPreserve)
            : parentToPreserve;
        return this;
    }

    public scanTextNode(selectionArgs?: SelectionArgs): void {
        if (!selectionArgs) return;
        const { selection } = selectionArgs;
        if (selection.startNode.node === this.node || selection.endNode.node === this.node) {
            const selectedNode = selection.startNode.node === this.node
                ? selection.startNode
                : selection.endNode;
            this.setStart(selectedNode.start).setEnd(selectedNode.end);
            if (selectedNode.parentToPreserve) this.setTopologyToPreserve(selectedNode.parentToPreserve);
            selectionArgs.startFound.value = true;
        }
    }

    public scanElementNode(selectionArgs?: SelectionArgs): void {
        let startNode: Node | null = null;
        let endNode: Node | null = null;
        let startFound = { value: true };
        if (selectionArgs) {
            const { selection } = selectionArgs;
            startFound = selectionArgs.startFound;
            startNode = selection.startNode.node;
            endNode = selection.endNode.node;
        }
        const children = Array.from(this.node!.childNodes);

        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            if (!startFound.value && node !== startNode && !node.contains(startNode)) continue;
            if (!startFound.value) this.setStart(i);

            const topology = new Topology()
                .fromNode(node)
                .setPath([...this.path, i])
                .setParent(this);

            node.nodeType === Node.TEXT_NODE
                ? topology.scanTextNode(selectionArgs)
                : topology.scanElementNode(selectionArgs);

            if (node === startNode && node.nodeType !== Node.TEXT_NODE) {
                startFound.value = true;
                topology.start = i;
            }

            this.children.push(topology);
            if (node === endNode || node.contains(endNode)) {
                this.setEnd(i);
                break;
            }
        }
    }

    public replaceWith(topology: Topology): void {
        this.setNode(topology.node!)
            .setChildren(topology.children)
            .setStart(topology.start)
            .setEnd(topology.end);
    }

    public findByNode(nodeToFind: Node, topology?: Topology): Topology | null {
        const isMain = !topology;
        topology = topology || this;
        if (isMain) while (topology.parent) topology = topology.parent;

        if (topology.node === nodeToFind) return topology;
        for (let child of topology.children) {
            const found = this.findByNode(nodeToFind, child);
            if (found) return found;
        }
        return null;
    }

    public findPartiallySelectedChildren(topology: Topology = this): Topology[] {
        const foundTopologies: Topology[] = [];
        if (topology.node!.nodeType === Node.TEXT_NODE && !topology.fullySelected)
            foundTopologies.push(topology);
        else for (let child of topology.children)
            foundTopologies.push(...this.findPartiallySelectedChildren(child));
        return foundTopologies;
    }

    public deepClone(partialTopologies: Topology[], topologiesMaps: { old: Topology, new: Topology }[] = []): Topology {
        const clonedNode = this.node!.cloneNode();
        const clonedTopology = new Topology()
            .fromNode(clonedNode)
            .setPath(this.path)
            .setParent(this.parent!);
        topologiesMaps.push({ old: this, new: clonedTopology });

        if (clonedTopology.node!.nodeType === Node.ELEMENT_NODE) {
            for (let child of this.children) {
                const clonedChild = child.deepClone(partialTopologies, topologiesMaps);
                clonedTopology.children.push(clonedChild);
                clonedTopology.node!.appendChild(clonedChild.node!);
            }
        } else if (partialTopologies.find((topology) => topology === this)) {
            clonedTopology.setStart(this.start).setEnd(this.end);
            if (this.topologyToPreserve) {
                const topologyToPreserve = topologiesMaps.find((map) => map.old === this.topologyToPreserve)?.new;
                if (!topologyToPreserve) throw new Error('No se encontró el nodo a preservar');

                clonedTopology.setTopologyToPreserve(topologyToPreserve);
            }
        }
        return clonedTopology;
    }
}