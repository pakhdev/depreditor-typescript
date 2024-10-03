class TextBlock {

    public nodes: Node[] = [];

    public addNode(node: Node): void {
        this.nodes.push(node);
    }

    public replaceLastNode(node: Node): void {
        this.nodes.pop();
        this.nodes.push(node);
    }

    public replaceNode(current: Node, replacement: Node): void {
        const index = this.nodes.findIndex(node => node === current);
        if (index === -1)
            throw new Error('Nodo no encontrado');
        this.nodes[index] = replacement;
    }
}

export default TextBlock;