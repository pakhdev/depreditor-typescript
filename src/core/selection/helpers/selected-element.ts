import { SelectionOffset } from '../interfaces/selection-offset.interface.ts';

export class SelectedElement {
    public path: number[];
    public offset: SelectionOffset;

    constructor(
        public readonly ownerEditor: HTMLDivElement,
        node: Node,
        offset: { start: number, end?: number },
    ) {
        this.path = this.calculatePath(node);
        if (offset.end === undefined)
            offset.end = node.nodeType === Node.TEXT_NODE
                ? (node as Text).length
                : 0;
        this.offset = { start: offset.start, end: offset.end };
    }

    public get node(): Node {
        let node: Node = this.ownerEditor;
        for (const index of this.path) {
            if (node.childNodes.length <= index)
                throw new Error('El índice no existe en el nodo');
            node = node.childNodes[index];
        }
        return node;
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

}