class TextBlock {

    public nodes: Node[] = [];

    public addNode(node: Node) {
        this.nodes.push(node);
    }

    public replaceLastNode(node: Node) {
        this.nodes.pop();
        this.nodes.push(node);
    }
}

export default TextBlock;