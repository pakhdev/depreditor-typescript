import ActionResolver from './helpers/action-resolver.ts';
import ActionTypes from './enums/action-types.enum.ts';
import ContainerBuilder from './helpers/container-builder/container-builder.ts';
import Core from '../../core/core.ts';
import ElementCreationProperties from './interfaces/element-creation-properties.interface.ts';
import SelectionWorkspace from '../selection-workspace/selection-workspace.ts';
import SelectionAdjuster from './helpers/selection-adjuster.ts';
import ContainerProperties from '../../core/containers/interfaces/container-properties.interface.ts';

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
            if (action === ActionTypes.INSERT) {
                newNodes = this.insert(element);
            } else if (action === ActionTypes.UNWRAP) {
                newNodes = this.unwrap(containerProperties);
            }

            // Run insert/wrap/unwrap command
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

    private unwrap(containerProperties: ContainerProperties): Node[] {
        const { cloneFragment, formatting } = this.workspace;
        const fragments = [
            cloneFragment.selectedPart(AffectedNodesPart.BEFORE),
            cloneFragment.selectedPart(AffectedNodesPart.AFTER),
            cloneFragment.selectedPart(AffectedNodesPart.WITHIN),
        ];

        const formattingEntry = formatting.entries.find(entry => entry.formatting === containerProperties);
        if (!formattingEntry) {
            throw new Error('Format not found');
        }

        formattingEntry.nodes.forEach(node => {
            const newNode = fragments[2].findByOriginalNode(node);
            const parentNode = newNode.parentNode;

            if (!parentNode) {
                throw new Error('Parent node not found');
            }

            Array.from(node.childNodes).forEach(child => parentNode.insertBefore(child, node));
            parentNode.removeChild(node);
        });

        return fragments.flatMap(fragment => fragment.nodes);
    }

}

export default CommandHandler;