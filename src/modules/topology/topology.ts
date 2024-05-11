export class Topology {

    public ownerEditor: HTMLDivElement | null = null;
    public parent: Topology | null = null;
    public children: Topology[] = [];
    public topologyToPreserve: Topology | null = null;
    public textBeforeSelection: string = '';
    public textWithinSelection: string = '';
    public textAfterSelection: string = '';

    constructor(public node: Node) {
        this.determineOwnerEditor();
    }

    public get start(): number {
        if (this.node.nodeType === Node.TEXT_NODE)
            return this.textBeforeSelection.length;
        else if (this.children.length > 0)
            return this.children[0].position;
        return 0;
    }

    public get end(): number {
        if (this.node.nodeType === Node.TEXT_NODE)
            return this.textBeforeSelection.length + this.textWithinSelection.length;
        else if (this.children.length > 0)
            return this.children[this.children.length - 1].position + 1;
        return 0;
    }

    public get length(): number {
        return this.node.nodeType === Node.TEXT_NODE
            ? this.node.textContent!.length
            : this.node.childNodes.length;
    }

    public get position(): number {
        if (!this.node.parentNode)
            return 0;
        return Array
            .from(this.node.parentNode.childNodes)
            .findIndex(child => child === this.node);
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

    public get path(): number[] | null {
        if (!this.ownerEditor)
            return null;

        const path: number[] = [];
        let currentNode: Node | null = this.node;

        while (currentNode !== this.ownerEditor && currentNode?.parentNode) {
            const index = Array.from(currentNode.parentNode.childNodes).indexOf(currentNode);
            if (index !== -1)
                path.unshift(index);
            currentNode = currentNode.parentNode;
        }

        return currentNode === this.ownerEditor ? path : null;
    }

    public get isPlacedInDom(): boolean {
        return this.path !== null;
    }

    public get firstSelected(): Topology {
        if (this.children.length === 0) return this;
        else return this.children[0].firstSelected;
    }

    public get lastSelected(): Topology {
        if (this.children.length === 0) return this;
        else return this.children[this.children.length - 1].lastSelected;
    }

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

    public determineOwnerEditor(node?: HTMLDivElement): Topology {
        let currentNode: Node | null = node || this.node;

        while (currentNode) {
            if (currentNode.nodeType === Node.ELEMENT_NODE && (currentNode as HTMLElement).id === 'editor-content') {
                this.setOwnerEditor(currentNode as HTMLDivElement);
                return this;
            }
            currentNode = currentNode.parentNode;
        }

        this.setOwnerEditor(null);
        return this;
    }

    public setOwnerEditor(ownerEditor: HTMLDivElement | null): Topology {
        this.ownerEditor = ownerEditor;
        if (this.children.length > 0)
            this.children.forEach(child => child.setOwnerEditor(ownerEditor));
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

    private findByNode(nodeToFind: Node, topology?: Topology): Topology | null {
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

}