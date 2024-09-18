import ClonedFragment from '../../selection-workspace/helpers/fragments-cloner/helpers/cloned-fragment.ts';
import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';
import HtmlElementBuilder from '../../utilities/html-element-builder/html-element-builder.ts';
import SelectionWorkspace from '../../selection-workspace/selection-workspace.ts';
import TextBlock from '../../selection-workspace/helpers/fragments-finder/helpers/text-block.ts';
import AffectedNodesPart from '../../../core/selection/enums/affected-nodes-part.enum.ts';

class ElementManipulator {
    private readonly workspace: SelectionWorkspace;

    constructor(workspace: SelectionWorkspace) {
        this.workspace = workspace;
    }

    public insertHtmlElement(element: HTMLElement): Node[] {
        const { selectedPart } = this.workspace.cloneFragment;
        return [
            ...selectedPart(AffectedNodesPart.BEFORE).nodes,
            element,
            ...selectedPart(AffectedNodesPart.AFTER).nodes,
        ];
    }

    public insertNodes(nodes: Node[]): Node[] {
        const { selectedPart } = this.workspace.cloneFragment;
        return [
            ...selectedPart(AffectedNodesPart.BEFORE).nodes,
            ...nodes,
            ...selectedPart(AffectedNodesPart.AFTER).nodes,
        ];
    }

    public wrap(element: HTMLElement, containerProperties: ContainerProperties): Node[] {
        const fragments = this.getFragments();
        this.unwrapFormattingNodes(containerProperties, fragments[1]);

        if (containerProperties.isBlock) {
            this.wrapNodes([...fragments[1].nodes], element);
        } else {
            const textBlocks = this.workspace.findFragment.findTextBlocks(fragments[1].nodes);
            this.wrapTextBlocks(textBlocks, element);
            if (containerProperties.childContainer)
                this.wrapChildContainers(containerProperties.childContainer, textBlocks);
        }
        return fragments.flatMap(fragment => fragment.nodes);
    }

    public unwrap(containerProperties: ContainerProperties): Node[] {
        const { formatting } = this.workspace;
        const fragments = this.getFragments();

        const formattingEntry = formatting.entries.find(entry => entry.formatting === containerProperties);
        if (!formattingEntry)
            throw new Error('Format not found');

        formattingEntry.nodes.forEach(node => this.unwrapNode(fragments[1].findByOriginalNode(node)));
        return fragments.flatMap(fragment => fragment.nodes);
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

    private getFragments(): ClonedFragment[] {
        const { cloneFragment } = this.workspace;
        return [
            cloneFragment.selectedPart(AffectedNodesPart.BEFORE),
            cloneFragment.selectedPart(AffectedNodesPart.WITHIN),
            cloneFragment.selectedPart(AffectedNodesPart.AFTER),
        ];
    }

    private unwrapFormattingNodes(containerProperties: ContainerProperties, fragmentWithin: ClonedFragment): void {
        const { formatting } = this.workspace;
        const similarFormattingEntries = formatting.getSimilar(containerProperties);
        const currentFormattingEntry = formatting.entries.find(entry => entry.formatting === containerProperties);
        const formattingNodesToUnwrap = [
            ...similarFormattingEntries,
            currentFormattingEntry!,
        ].flatMap(entry => entry.nodes);

        formattingNodesToUnwrap.forEach(node => this.unwrapNode(fragmentWithin.findByOriginalNode(node)));
    }

    private wrapTextBlocks(textBlocks: TextBlock[], container: HTMLElement): void {
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

export default ElementManipulator;