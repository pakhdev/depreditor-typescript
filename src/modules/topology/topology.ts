import { getNodePath } from '../../helpers/nodeRouter.helper.ts';
import { SelectionArgs } from './interfaces/selection-args.interface.ts';
import { NodeSelection } from '../selection-manager/node-selection.ts';
import { SelectionManager } from '../selection-manager/selection-manager.ts';

export class Topology extends NodeSelection {

    public path: number[] = [];
    public children: Topology[] = [];
    public parent: Topology | null = null;
    public topologyToPreserve: Topology | null = null;

    get textContent(): string {
        if (!this.node || this.node.nodeType !== Node.TEXT_NODE)
            return '';
        return this.node.textContent || '';
    }

    /**
     * Crea una topología. Solo se asigna el nodo y el final de la selección.
     * El resto de propiedades se tiene que asignar fuera de este método.
     */
    public fromNode(node: Node): Topology {
        this.setNode(node).setEnd(this.length ? this.length : 0);
        return this;
    }

    /**
     * Crea una topología a partir de una selección.
     * Adicionalmente, se crea y se asigna una topología del nodo padre del nodo común.
     */
    public fromSelection(selection: SelectionManager): Topology {
        const ancestorPath = getNodePath(selection.commonAncestor, selection.editableDiv);
        if (!ancestorPath)
            throw new Error('No se encontró el ancestro común');

        this.fromNode(selection.commonAncestor).setPath(ancestorPath);

        const selectionArgs: SelectionArgs = { selection, startFound: { value: false } };
        if (this.node.nodeType === Node.TEXT_NODE) this.scanTextNode(selectionArgs);
        else this.scanElementNode(selectionArgs);

        if (ancestorPath.length > 0 && this.node.parentNode) {
            const parentTopology = new Topology()
                .fromNode(this.node.parentNode)
                .setPath(ancestorPath.slice(0, -1))
                .setChildren([this])
                .recalculateSelection();
            this.setParent(parentTopology);
        }

        return this;
    }

    public setNode(node: Node): Topology {
        this._node = node;
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

    public setTopologyToPreserve(parentToPreserve: Node | Topology | null): Topology {
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

            if (selectionArgs?.selection.isRange || topology.node !== startNode || node.nodeType === Node.TEXT_NODE)
                this.children.push(topology);
            if (node === endNode || node.contains(endNode)) {
                this.setEnd(i);
                break;
            }
        }
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

    /**
     * Inserta la topología del buffer en la posición indicada en las propiedades de la topología.
     */
    public mount(): Topology {
        return this;
    }

    /**
     * Desmonta el nodo del DOM y elimina la topología de su nodo padre.
     * Se actualizarán los índices de inicio y fin y las rutas de las topologías afectadas.
     */
    public unmount(): void {
        if (!this.parent?.node)
            throw new Error('No se encontró el nodo de referencia, su nodo padre o el nodo a desmontar');
        if (this.isPlacedInDom)
            throw new Error('No se puede desmontar una topología que no se encuentra en el DOM');

        const topologyChildIdx = this.parent.children.indexOf(this);
        if (topologyChildIdx === -1)
            throw new Error('No se encontró la topología de referencia en su nodo padre');

        this.parent.children.splice(topologyChildIdx, 1);
        this.parent.recalculateSelection().recalculatePaths();
        this.parent.node.removeChild(this.node);
    }

    /**
     * Clona las propiedades de la topología y todas sus subtopologías.
     * Se clonan los nodos y se sobreescribe la propiedad 'node'
     * Si existiera una topología a preservar, se asignará una topología clonada de la misma.
     */
    public deepClone(topologyToPreserve: Topology | null = null, setParent: Topology | null = null): Topology {
        const clonedNode = this.node.cloneNode();
        const { nodeType } = clonedNode;

        const clonedTopology = new Topology()
            .fromNode(clonedNode);

        if (nodeType === Node.TEXT_NODE && !this.fullySelected)
            clonedTopology.setTopologyToPreserve(topologyToPreserve);

        if (nodeType === Node.ELEMENT_NODE) {
            for (const childTopology of this.children) {
                if (!topologyToPreserve)
                    topologyToPreserve = this;
                if (!setParent)
                    setParent = clonedTopology;
                const clonedChild = childTopology.deepClone(topologyToPreserve, setParent);
                clonedTopology.children.push(clonedChild);
                clonedNode.appendChild(clonedChild.node);
            }
        }

        clonedTopology
            .setParent(this.parent)
            .setPath(this.path)
            .setStart(this.start)
            .setEnd(this.end);

        return clonedTopology;
    }

    // Recalcula las rutas de la topología y todas sus subtopologías.
    public recalculatePaths(setParent?: Topology, setPath?: number[]): Topology {
        if (!this.isPlacedInDom)
            throw new Error('No se puede calcular las rutas de una topología que no ha sido insertada en el DOM');
        if (this.parent && !this.parent.node)
            throw new Error('No se puede calcular las rutas al no encontrar el nodo en la topología-padre');

        if (setParent && setPath)
            this.setParent(setParent).setPath(setPath);
        else if (this.parent)
            this.setPath([...this.parent.path, this.parent.children.indexOf(this)]);
        else
            this.setPath([]);

        if (this.node.nodeType !== Node.ELEMENT_NODE) return this;

        const childNodes = Array.from(this.node.childNodes);
        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];
            const correspondingTopology = this.children.find(child => child.node === childNode);
            if (correspondingTopology)
                correspondingTopology.recalculatePaths(this, [...this.path, i]);
        }
        return this;
    }

    /**
     * Recalcula el rango de nodos-hijos seleccionados de la topología.
     * Solo afecta a las topologías que tengan nodos-hijos seleccionados.
     * Se reasignarán los índices de inicio y fin de las topologías.
     * No se tocarán las topologías-hijas.
     */
    public recalculateSelection(): Topology {
        if (this.children.length > 0 && this.node.nodeType === Node.ELEMENT_NODE) {
            const childNodes = Array.from(this.node.childNodes);
            const firstSelectedChild = this.children[0];
            if (!firstSelectedChild.node)
                throw new Error('No se encontró el nodo en la topología');
            const startIndex = childNodes.indexOf(firstSelectedChild.node);
            if (startIndex === -1)
                throw new Error('No se encontró el nodo seleccionado en la topología');
            this.setStart(startIndex).setEnd(startIndex + this.children.length);
        }
        return this;
    }

    /**
     * Comprueba si la topología ha sido insertada en el DOM.
     * Se considera que una topología ha sido insertada en el DOM si tiene una ruta asignada o si su topología padre la tiene.
     */
    public get isPlacedInDom(): boolean {
        return this.path.length > 0 || (this.parent ? this.parent.isPlacedInDom : false);
    }
}