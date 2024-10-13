import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';
import HtmlElementBuilder from '../../utilities/html-element-builder/html-element-builder.ts';
import TextBlock from '../../utilities/fragments-finder/entities/text-block.ts';
import Processor from '../../processor.ts';

class ElementWrapper {
    constructor(private readonly processor: Processor) {}

    public wrap(nodes: Node[], wrapperElement: Node, containerProperties: ContainerProperties): Node[] {
        const tempContainer = HtmlElementBuilder.createElement('div');
        tempContainer.append(...nodes);
        this.unwrapFormattingNodes(containerProperties, nodes);
        if (containerProperties.isBlock) {
            this.wrapNodes([...nodes], wrapperElement);
        } else {
            const textBlocks = this.processor.fragmentsFinder.findTextBlocks(nodes);
            this.wrapTextBlocks(textBlocks, wrapperElement);
            if (containerProperties.childContainer)
                this.wrapChildContainers(containerProperties.childContainer, textBlocks);
        }
        return Array.from(tempContainer.childNodes);
    }

    public unwrap(nodes: Node[], containerProperties: ContainerProperties): Node[] {
        const formatting = this.processor.formattingReader.getNodesFormatting(nodes);
        const formattingEntry = formatting.entries.find(entry => entry.formatting === containerProperties);
        if (!formattingEntry)
            throw new Error('Formato no encontrado');

        formattingEntry.nodes.forEach(node => this.unwrapNode(node));
        return formattingEntry.nodes;
    }

    private unwrapNode(node: Node): void {
        const parentNode = node.parentNode;
        if (!parentNode)
            throw new Error('Nodo padre no encontrado');

        Array.from(node.childNodes).forEach(child => parentNode.insertBefore(child, node));
        parentNode.removeChild(node);
    }

    private wrapNodes(nodes: Node[], container: Node): void {
        if (!nodes.length)
            return;
        const parentNode = nodes[0].parentNode;
        if (!parentNode)
            throw new Error('Nodo padre no encontrado');

        const clonedContainer = container.cloneNode();
        parentNode.insertBefore(clonedContainer, nodes[0]);
        nodes.forEach(node => clonedContainer.appendChild(node));
    }

    private unwrapFormattingNodes(containerProperties: ContainerProperties, nodes: Node[]): void {
        const formatting = this.processor.formattingReader.getNodesFormatting(nodes);
        const similarFormattingEntries = formatting.getSimilar(containerProperties);
        const currentFormattingEntries = formatting.entries.filter(entry => entry.formatting === containerProperties);
        const formattingNodesToUnwrap = [
            ...similarFormattingEntries,
            ...currentFormattingEntries,
        ].flatMap(entry => entry.nodes);
        formattingNodesToUnwrap.forEach(node => this.unwrapNode(node));
    }

    private wrapTextBlocks(textBlocks: TextBlock[], container: Node): void {
        textBlocks.forEach(textBlock => this.wrapNodes([...textBlock.nodes], container));
    }

    private wrapChildContainers(childContainerProps: ContainerProperties, textBlocks: TextBlock[]): void {
        const { tagName, attributes, styles, classes } = childContainerProps;
        const childContainer = HtmlElementBuilder.createElement(tagName, { ...attributes, styles, classes });

        textBlocks.forEach(textBlock => {
            textBlock.nodes.forEach(line => this.wrapNodes([line], childContainer));
        });
    }
}

export default ElementWrapper;