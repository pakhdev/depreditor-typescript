import Core from '../../../../../core/core.ts';
import TextBlock from './text-block.ts';

class FindTextBlocks {

    private readonly tempContainer: HTMLElement;
    private targetElements: Node[] = [];
    private readonly nodesMap: { original: Node, clone: Node }[] = [];

    constructor(private readonly core: Core) {
        this.tempContainer = document.createElement('div');
    }

    public from(nodes: Node[]): TextBlock[] {
        const clonedNodes = this.cloneNodes(nodes);
        for (const node of clonedNodes)
            this.tempContainer.appendChild(node);
        this.targetElements = this.findTargetElements();

        const textBlocks: TextBlock[] = [];
        while (this.targetElements.length)
            textBlocks.push(this.composeTextBlock(this.targetElements[0]));
        textBlocks.forEach(textBlock => this.mapClonesToOriginals(textBlock));

        return textBlocks;
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

    private findOriginalNode(node: Node): Node {
        const foundNodePair = this.nodesMap.find(({ clone }) => clone === node);
        if (!foundNodePair)
            throw new Error('Nodo no encontrado');
        return foundNodePair.original;
    }

    private mapClonesToOriginals(textBlock: TextBlock): TextBlock {
        textBlock.nodes.forEach(node => textBlock.replaceNode(node, this.findOriginalNode(node)));
        return textBlock;
    }

    private findTargetElements(container: Node = this.tempContainer): Node[] {
        const targetNodes: Node[] = [];
        container.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE || !this.core.containers.identify(node)?.isBlock) {
                targetNodes.push(node);
            } else if (node.hasChildNodes()) {
                targetNodes.push(...this.findTargetElements(node));
            }
        });
        return targetNodes;
    }

    private composeTextBlock(node: Node): TextBlock {
        const textBlock = new TextBlock();
        let currentNode: Node | null = node;

        while (currentNode && !this.core.containers.identify(currentNode)?.isBlock) {
            if (textBlock.nodes.length === 1)
                textBlock.replaceLastNode(currentNode);

            const validNodes = this.findValidNodes(currentNode);
            validNodes.forEach(node => {
                textBlock.addNode(node);
                this.targetElements = this.targetElements.filter(targetElement => targetElement !== node);
            });

            if (validNodes.length > 1)
                return textBlock;

            currentNode = currentNode.parentNode;
        }

        return textBlock;
    }

    private findValidNodes(node: Node): Node[] {
        const nodes: Node[] = [];
        let currentNode: Node | null = node;
        while (currentNode) {
            if (this.isValidNode(currentNode)) {
                nodes.push(node);
                this.targetElements = this.targetElements.filter(targetElement => targetElement !== node);
            } else return nodes;

            currentNode = currentNode.nextSibling;
        }
        return nodes;
    }

    private isValidNode(node: Node): boolean {
        if (this.core.containers.identify(node)?.isBlock)
            return false;
        const targetNodes = this.targetElements.filter(targetElement => node.contains(targetElement));
        return targetNodes.length === 1;
    }
}

export default FindTextBlocks;