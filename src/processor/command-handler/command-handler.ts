import ActionResolver from './helpers/action-resolver.ts';
import ActionTypes from './enums/action-types.enum.ts';
import ContainerBuilder from './helpers/container-builder/container-builder.ts';
import ContainerProperties from '../../core/containers/interfaces/container-properties.interface.ts';
import Core from '../../core/core.ts';
import ElementCreationProperties from './interfaces/element-creation-properties.interface.ts';
import SelectionAdjuster from './helpers/selection-adjuster.ts';
import SelectionWorkspace from '../selection-workspace/selection-workspace.ts';
import HtmlElementBuilder from '../utilities/html-element-builder/html-element-builder.ts';

class CommandHandler {

    private readonly workspace: SelectionWorkspace;

    constructor(private readonly core: Core) {
        this.workspace = new SelectionWorkspace(this.core);
    }

    public execute(elementProperties: ElementCreationProperties): void {
        ContainerBuilder.create(elementProperties).then((element) => {
            if (!element)
                throw new Error('El elemento no está definido');

            const containerProperties = this.core.containers.identify(element);
            if (!containerProperties)
                throw new Error('El elemento no está definido');

            const action = ActionResolver.resolveContainerAction(this.workspace, containerProperties);
            SelectionAdjuster.adjust(this.workspace, containerProperties, action);

            let newNodes: Node[] = [];
            if (action === ActionTypes.INSERT)
                newNodes = this.insert(element);
            else if (action === ActionTypes.UNWRAP)
                newNodes = this.unwrap(containerProperties);
            else if (action === ActionTypes.WRAP)
                newNodes = this.wrap(element, containerProperties);

            // Create transaction
            // Commit transaction
        });
    }

    private insert(element: HTMLElement): Node[] {
        const { selectedPart } = this.workspace.cloneFragment;
        return [
            ...selectedPart(AffectedNodesPart.BEFORE).nodes,
            element,
            ...selectedPart(AffectedNodesPart.AFTER).nodes,
        ];
    }

    private wrap(element: HTMLElement, containerProperties: ContainerProperties): Node[] {
        const { cloneFragment, formatting } = this.workspace;
        const similarFormattingEntries = formatting.getSimilar(containerProperties);
        const currentFormattingEntry = formatting.entries.find(entry => entry.formatting === containerProperties);
        const formattingNodesToUnwrap =
            [
                ...similarFormattingEntries,
                currentFormattingEntry!,
            ].flatMap(entry => entry.nodes);

        const fragments = [
            cloneFragment.selectedPart(AffectedNodesPart.BEFORE),
            cloneFragment.selectedPart(AffectedNodesPart.WITHIN),
            cloneFragment.selectedPart(AffectedNodesPart.AFTER),
        ];

        formattingNodesToUnwrap.forEach(node => this.unwrapNode(fragments[1].findByOriginalNode(node)));
        if (containerProperties.isBlock) {
            this.wrapNodes([...fragments[1].nodes], element);
        } else {
            const textBlocks = this.workspace.findFragment.findTextBlocks(fragments[1].nodes);
            textBlocks.forEach(textBlock => this.wrapNodes([...textBlock.nodes], element));

            if (containerProperties.childContainer) {
                const { tagName, attributes, styles, classes } = containerProperties.childContainer;
                const childContainer = HtmlElementBuilder.createElement(tagName, { ...attributes, styles, classes });
                textBlocks.forEach(textBlock =>
                    textBlock.nodes.forEach(line => this.wrapNodes([line], childContainer)),
                );
            }
        }
        return fragments.flatMap(fragment => fragment.nodes);
    }

    private unwrap(containerProperties: ContainerProperties): Node[] {
        const { cloneFragment, formatting } = this.workspace;
        const fragments = [
            cloneFragment.selectedPart(AffectedNodesPart.BEFORE),
            cloneFragment.selectedPart(AffectedNodesPart.WITHIN),
            cloneFragment.selectedPart(AffectedNodesPart.AFTER),
        ];

        const formattingEntry = formatting.entries.find(entry => entry.formatting === containerProperties);
        if (!formattingEntry)
            throw new Error('Format not found');

        formattingEntry.nodes.forEach(node => this.unwrapNode(fragments[1].findByOriginalNode(node)));
        return fragments.flatMap(fragment => fragment.nodes);
    }

    private unwrapNode(node: Node): void {
        const parentNode = node.parentNode;
        if (!parentNode)
            throw new Error('Parent node not found');

        Array.from(node.childNodes).forEach(child => parentNode.insertBefore(child, node));
        parentNode.removeChild(node);
    }

    private wrapNodes(nodes: Node[], container: Node): void {
        if (!nodes.length)
            return;
        const parentNode = nodes[0].parentNode;
        if (!parentNode)
            throw new Error('Parent node not found');

        const clonedContainer = container.cloneNode();
        parentNode.insertBefore(clonedContainer, nodes[0]);
        nodes.forEach(node => clonedContainer.appendChild(node));
    }

}

export default CommandHandler;