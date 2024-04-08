import { getNodePath } from '../../helpers/nodeRouter.helper.ts';
import { SelectionArgs } from './interfaces/selection-args.interface.ts';
import { NodeSelection } from '../selection-manager/node-selection.ts';
import { SelectionManager } from '../selection-manager/selection-manager.ts';
import { TopologyCloningResult } from './interfaces/topology-cloning-result.interface.ts';

export class Topology extends NodeSelection {

    public path: number[] = [];
    public children: Topology[] = [];
    public parent: Topology | null = null;
    public topologyToPreserve: Topology | null = null;

    public fromNode(node: Node): Topology {
        this.node = node;
        this.parentToPreserve = node.parentNode; // ??
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

    public getTextInRange(start?: number, end?: number): string {
        if (!this.node || this.node.nodeType !== Node.TEXT_NODE)
            return '';
        if (start === undefined || end === undefined)
            return this.node.textContent || '';
        return this.node.textContent?.slice(start, end) || '';
    }

    public setNode(node: Node): Topology {
        this.node = node;
        return this;
    }

    public setPath(path: number[]): Topology {
        this.path = path;
        return this;
    }

    public setParent(parent: Topology | null): Topology {
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

    public setText(text: string): Topology {
        if (this.node!.nodeType !== Node.TEXT_NODE) throw new Error('No se puede establecer texto en un nodo que no es de texto');
        this.node!.textContent = text;
        this.setStart(0).setEnd(text.length);
        return this;
    }

    public removeChild(child: Topology): void {
        this.children = this.children.filter((topology) => topology !== child);
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

            if (selectionArgs?.selection.isRange || topology.node !== startNode || node.nodeType === Node.TEXT_NODE)
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
            .setEnd(topology.end > this.length ? this.length : topology.end);
        // TODO: Es necesario reemplazar path y parent?
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

    public findTopologiesToSplit(topology: Topology = this): Topology[] {
        const foundTopologies: Topology[] = [];
        if (topology.node!.nodeType === Node.TEXT_NODE && !topology.fullySelected) {
            foundTopologies.push(topology);
        } else for (let child of topology.children)
            foundTopologies.push(...this.findTopologiesToSplit(child));
        return foundTopologies;
    }

    /**
     * Clona la topología y todas sus subtopologías con los nodos correspondientes.
     * Solo se clonarán los nodos que estén seleccionados.
     * No se asigna la propiedad path(ruta) a las topologías clonadas. Será asignada al usar el método
     * recalculatePaths después de insertar los nodos clonados en el DOM.
     */
    public deepClone(retrieveCloneOf: Topology, topologyToPreserve: Topology | null = null, setParent: Topology | null = null): TopologyCloningResult {
        if (!this.node) throw new Error('No se puede clonar una topología sin nodo');
        let retrievedTopology: Topology | null = null;
        const clonedNode = this.node.cloneNode();
        const { nodeType } = clonedNode;
        const clonedTopology = new Topology()
            .fromNode(clonedNode)
            .setParent(setParent || this.parent);
        if (nodeType === Node.TEXT_NODE && !this.fullySelected)
            clonedTopology
                .setTopologyToPreserve(topologyToPreserve!)
                .setStart(this.start)
                .setEnd(this.end);

        if (nodeType === Node.ELEMENT_NODE) {
            for (const childTopology of this.children) {

                if (!topologyToPreserve) topologyToPreserve = this;
                if (!setParent) setParent = clonedTopology;
                clonedTopology.setEnd(this.children.length);

                const cloningResult = childTopology.deepClone(retrieveCloneOf, topologyToPreserve, setParent);
                const { clonedTopology: clonedChild } = cloningResult;
                if (cloningResult.retrievedTopology) retrievedTopology = cloningResult.retrievedTopology;

                clonedTopology.children.push(clonedChild);
                clonedTopology.node!.appendChild(clonedChild.node!);
            }
        }

        if (this === retrieveCloneOf) retrievedTopology = clonedTopology;
        return { clonedTopology, retrievedTopology };
    }
}