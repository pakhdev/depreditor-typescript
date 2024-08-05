class ClonedFragment {

    private oldToNewMap: Map<Node, Node> = new Map();
    private tempContainer: HTMLDivElement = document.createElement('div');

    public get nodes(): Node[] {
        return Array.from(this.tempContainer.childNodes);
    }

    public add(oldNode: Node, newNode: Node, isRoot: boolean): void {
        if (isRoot)
            this.tempContainer.appendChild(newNode);
        this.oldToNewMap.set(oldNode, newNode);
    }

    public findByOriginalNode(oldNode: Node): Node {
        const newNode = this.oldToNewMap.get(oldNode);
        if (!newNode)
            throw new Error('No se encontró el nodo clonado');
        return newNode;
    }
}

export default ClonedFragment;
