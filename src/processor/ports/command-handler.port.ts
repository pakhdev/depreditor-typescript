import ElementCreationProperties from '../command-handler/interfaces/element-creation-properties.interface.ts';
import CommandHandler from '../command-handler/command-handler.ts';
import SelectionWorkspace from '../selection-workspace/selection-workspace.ts';

class CommandHandlerPort {
    constructor(private readonly commandHandler: CommandHandler) {}

    public createAndInsert(elementProperties: ElementCreationProperties, selectionWorkspace?: SelectionWorkspace): void {
        return this.commandHandler.createAndInsert(elementProperties, selectionWorkspace);
    }

    public insertNodes(nodes: Node[], selectionWorkspace?: SelectionWorkspace): void {
        return this.commandHandler.insertNodes(nodes, selectionWorkspace);
    }

    public handleText(text: string | null, selectionWorkspace?: SelectionWorkspace): void {
        return this.commandHandler.handleText(text, selectionWorkspace);
    }
}

export default CommandHandlerPort;