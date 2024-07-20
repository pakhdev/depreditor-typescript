class FindTextBlocks {

    private readonly tempContainer: HTMLElement;
    private readonly nodesMap: { original: Node, clone: Node }[] = [];

    constructor() {
        this.tempContainer = document.createElement('div');
    }

    public from(nodes: Node[]) {
        const clonedNodes = this.cloneNodes(nodes);
        for (const node of clonedNodes)
            this.tempContainer.appendChild(node);
    }

    private cloneNodes(nodes: Node[]): Node[] {
        return nodes.map(node => {
            const clone = node.cloneNode();
            this.nodesMap.push({ original: node, clone });
            if (node.hasChildNodes()) {
                const clonedChildren = this.cloneNodes(Array.from(node.childNodes));
                for (const child of clonedChildren)
                    clone.appendChild(child);
            }
            return clone;
        });
    }

    private findOriginalNode(node: Node): Node | null {
        const foundNodePair = this.nodesMap.find(({ clone }) => clone === node);
        return foundNodePair?.original ?? null;
    }
}

export default FindTextBlocks;