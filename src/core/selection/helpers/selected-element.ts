import SelectionOffset from '../interfaces/selection-offset.interface.ts';

class SelectedElement {
    public path: number[];
    public offset: SelectionOffset;

    constructor(
        public readonly ownerEditor: HTMLDivElement,
        node: Node,
        offset: { start: number, end?: number },
    ) {
        if (offset.end === undefined)
            offset.end = node.nodeType === Node.TEXT_NODE
                ? (node as Text).length
                : 0;
        this.offset = { start: offset.start, end: offset.end };
        this.path = this.calculatePath(node);
    }

    public get node(): Node {
        return this.getNodeByPath(this.path);
    }

    public get parentNode(): Node {
        return this.getNodeByPath(this.path.slice(0, -1));
    }

    public get previousSibling(): { node: Node, path: number [] } | null {
        const index = this.position - 1;
        if (index < 0)
            return null;
        return {
            node: this.parentNode.childNodes[index],
            path: this.path.slice(0, -1).concat(index),
        };
    }

    public get nextSibling(): { node: Node, path: number [] } | null {
        const index = this.position + 1;
        if (this.parentNode.childNodes.length <= index)
            return null;
        return {
            node: this.parentNode.childNodes[index],
            path: this.path.slice(0, -1).concat(index),
        };
    }

    public get exists(): boolean {
        try {
            return this.node !== null;
        } catch (e) {
            return false;
        }
    }

    public get position(): number {
        if (this.path.length === 0)
            return 0;
        return this.path[this.path.length - 1];
    }

    private calculatePath(node: Node): number[] {
        const path: number[] = [];
        let currentNode: Node | null = node;

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

    private getNodeByPath(path: number[]): Node {
        let node: Node = this.ownerEditor;
        for (const index of path) {
            if (node.childNodes.length <= index)
                throw new Error('El índice no existe en el nodo');
            node = node.childNodes[index];
        }
        return node;
    }

}

export default SelectedElement;