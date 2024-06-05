export class Topology {

    public ownerEditor!: HTMLDivElement;
    public parent: Topology | null = null;
    public children: Topology[] = [];
    public start: number = 0;
    public end: number = 0;

    constructor(public readonly node: Node) {
        this.determineOwnerEditor(node);
    }

    public get path(): number[] {
        if (!this.ownerEditor)
            throw new Error('No se ha encontrado el editor');

        const path: number[] = [];
        let currentNode: Node | null = this.node;

        while (currentNode !== this.ownerEditor && currentNode?.parentNode) {
            const index = Array.from(currentNode.parentNode.childNodes).indexOf(currentNode as ChildNode);
            if (index !== -1)
                path.unshift(index);
            currentNode = currentNode.parentNode;
        }

        if (currentNode !== this.ownerEditor)
            throw new Error('El nodo no se encuentra en el editor');

        return path;
    }

    public get length(): number {
        return this.node.nodeType === Node.TEXT_NODE
            ? this.node.textContent!.length
            : this.node.childNodes.length;
    }

    public get position(): number {
        return this.path[this.path.length - 1];
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

    public get firstSelected(): Topology {
        if (this.children.length === 0) return this;
        else return this.children[0].firstSelected;
    }

    public get lastSelected(): Topology {
        if (this.children.length === 0) return this;
        else return this.children[this.children.length - 1].lastSelected;
    }

    public determineOwnerEditor(node: Node): Topology {
        let currentNode: Node | null = node;

        while (currentNode) {
            if (currentNode.nodeType === Node.ELEMENT_NODE && (currentNode as HTMLElement).classList.contains('editor-content')) {
                this.setOwnerEditor(currentNode as HTMLDivElement);
                return this;
            }
            currentNode = currentNode.parentNode;
        }

        throw new Error('No se ha encontrado el editor');
    }

    public setOwnerEditor(ownerEditor: HTMLDivElement): Topology {
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

    public setStart(start: number): Topology {
        this.start = start;
        return this;
    }

    public setEnd(end: number): Topology {
        this.end = end;
        return this;
    }

}
