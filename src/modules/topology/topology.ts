import { getNodePosition } from '../../helpers/nodeRouter.helper.ts';

export class Topology {

    public parent: Topology | null = null;
    public children: Topology[] = [];
    public topologyToPreserve: Topology | null = null;
    public textBeforeSelection: string = '';
    public textWithinSelection: string = '';
    public textAfterSelection: string = '';

    public path: number[] = [];

    constructor(public node: Node) {}

    public get start(): number {
        if (this.node.nodeType === Node.TEXT_NODE)
            return this.textBeforeSelection.length;
        else if (this.children.length > 0)
            return getNodePosition(this.children[0].node, this.node);
        return 0;
    }

    public get end(): number {
        if (this.node.nodeType === Node.TEXT_NODE)
            return this.textBeforeSelection.length + this.textWithinSelection.length;
        else if (this.children.length > 0)
            return getNodePosition(this.children[0].node, this.node) + 1;
        return 0;
    }

    public get length(): number {
        return this.node.nodeType === Node.TEXT_NODE
            ? this.node.textContent!.length
            : this.node.childNodes.length;
    }

    public get isRange(): boolean {
        return this.start !== this.end;
    }

    public get fullySelected(): boolean {
        return this.startSelected && this.endSelected;
    }

    public get startSelected(): boolean {
        return this.start === 0;
    }

    public get endSelected(): boolean {
        return !this.length || this.end === this.length;
    }

    public get parentNode(): Node {
        if (!this.node.parentNode)
            throw new Error('El nodo no tiene un nodo padre');
        return this.node.parentNode;
    }

    /**
     * Comprueba si la topología ha sido insertada en el DOM.
     * Se considera que una topología ha sido insertada en el DOM si tiene una ruta asignada o si su topología padre la tiene.
     */
    public get isPlacedInDom(): boolean {
        return this.path.length > 0 || (this.parent ? this.parent.isPlacedInDom : false);
    }

    public get firstSelected(): Topology {
        if (this.children.length === 0) return this;
        else return this.children[0].firstSelected;
    }

    public get lastSelected(): Topology {
        if (this.children.length === 0) return this;
        else return this.children[this.children.length - 1].lastSelected;
    }

    public get textContent(): string {
        if (!this.node || this.node.nodeType !== Node.TEXT_NODE)
            return '';
        return this.node.textContent || '';
    }

    // Determina los fragmentos de texto antes, dentro y después de la selección.
    public determineTextSelection({ start: selectionStart, end: selectionEnd }: {
        start?: number;
        end?: number
    }): Topology {
        if (this.node.nodeType !== Node.TEXT_NODE || !this.node.textContent)
            return this;

        const textLength = this.node.textContent.length;
        const start = selectionStart ?? 0;
        const end = selectionEnd ?? textLength;

        this.textBeforeSelection = this.node.textContent.slice(0, start);
        this.textWithinSelection = this.node.textContent.slice(start, end);
        this.textAfterSelection = this.node.textContent.slice(end, textLength);
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
        if (!this.parent)
            throw new Error('No se encontró el nodo padre');
        if (this.isPlacedInDom)
            throw new Error('No se puede desmontar una topología que no se encuentra en el DOM');

        const topologyChildIdx = this.parent.children.indexOf(this);
        if (topologyChildIdx === -1)
            throw new Error('No se encontró la topología de referencia en su nodo padre');

        this.parent.children.splice(topologyChildIdx, 1);
        this.parentNode.removeChild(this.node);
        this.parent.recalculateSelection().recalculatePaths();
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

}