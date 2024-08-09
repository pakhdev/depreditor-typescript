import ActionResolver from './helpers/action-resolver.ts';
import ActionTypes from './enums/action-types.enum.ts';
import ContainerBuilder from './helpers/container-builder/container-builder.ts';
import Core from '../../core/core.ts';
import ElementCreationProperties from './interfaces/element-creation-properties.interface.ts';
import SelectionAdjuster from './helpers/selection-adjuster.ts';
import SelectionWorkspace from '../selection-workspace/selection-workspace.ts';
import ElementManipulator from './helpers/element-manipulator.ts';

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
            const elementManipulator = new ElementManipulator(this.workspace);
            if (action === ActionTypes.INSERT)
                newNodes = elementManipulator.insert(element);
            else if (action === ActionTypes.UNWRAP)
                newNodes = elementManipulator.unwrap(containerProperties);
            else if (action === ActionTypes.WRAP)
                newNodes = elementManipulator.wrap(element, containerProperties);

            // Create transaction
            // Commit transaction
        });
    }

}

export default CommandHandler;