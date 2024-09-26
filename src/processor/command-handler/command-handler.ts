import ActionResolver from './helpers/action-resolver.ts';
import ActionTypes from './enums/action-types.enum.ts';
import ContainerBuilder from './helpers/container-builder/container-builder.ts';
import Core from '../../core/core.ts';
import ElementCreationProperties from './interfaces/element-creation-properties.interface.ts';
import SelectionAdjuster from './helpers/selection-adjuster.ts';
import SelectionWorkspace from '../selection-workspace/selection-workspace.ts';
import ElementManipulator from './helpers/element-manipulator.ts';

class CommandHandler {

    constructor(private readonly core: Core) {}

    public createAndInsert(
        elementProperties: ElementCreationProperties,
        selectionWorkspace: SelectionWorkspace = new SelectionWorkspace(this.core),
    ): void {
        ContainerBuilder.create(elementProperties).then((creationResult) => {
            if (!creationResult || (creationResult instanceof Array && creationResult.length === 0))
                throw new Error('Error al crear el elemento');

            if (!(creationResult instanceof Array))
                creationResult = [creationResult];

            this.insertNodes(creationResult, selectionWorkspace);
        });
    }

    public insertNodes(nodes: Node[], selectionWorkspace: SelectionWorkspace = new SelectionWorkspace(this.core)): void {
        if (!nodes.length)
            throw new Error('No hay nodos para insertar');

        let action: ActionTypes = ActionTypes.INSERT;

        const containerProperties = this.core.containers.identify(nodes[0]);
        if (containerProperties) {
            action = ActionResolver.resolveContainerAction(selectionWorkspace, containerProperties);
            SelectionAdjuster.adjust(selectionWorkspace, containerProperties, action);
        } else if (nodes.some(node => node.nodeType !== Node.TEXT_NODE && (node as HTMLElement).tagName !== 'BR')) {
            throw new Error('El elemento no está definido');
        }

        let newNodes: Node[] = [];
        const elementManipulator = new ElementManipulator(selectionWorkspace);
        if (action === ActionTypes.INSERT)
            newNodes = elementManipulator.insertNodes(nodes);
        else if (action === ActionTypes.UNWRAP)
            newNodes = elementManipulator.unwrap(containerProperties!);
        else if (action === ActionTypes.WRAP)
            newNodes = elementManipulator.wrap(nodes[0], containerProperties!);

        this.core.transactions
            .builder(selectionWorkspace)
            .createRemovalOps()
            .createInjectingOps(newNodes)
            .test();
        // .setInitialSelection(selectionWorkspace.selection)
        // .selectDeferredSelection()
        // .build();

        // Commit transaction
    }

    public handleText(
        text: string | null,
        selectionWorkspace: SelectionWorkspace = new SelectionWorkspace(this.core),
    ): void {
        console.log('handleText recibido', text);
        console.log('selectionWorkspace', selectionWorkspace);
    }

}

export default CommandHandler;