import CommandHandler from '../command-handler/command-handler.ts';
import SelectionWorkspace from '../selection-workspace/selection-workspace.ts';
import Core from '../../core/core.ts';

class CommandHandlerPort {

    private commandHandler: CommandHandler;
    
    constructor(private readonly core: Core) {
        this.commandHandler = new CommandHandler(this.core);
    }

    public insertNodes(nodes: Node[], selectionWorkspace?: SelectionWorkspace): void {
        return this.commandHandler.insertNodes(nodes, selectionWorkspace);
    }

    public handleText(text: string | null, selectionWorkspace?: SelectionWorkspace): void {
        return this.commandHandler.handleText(text, selectionWorkspace);
    }
}

export default CommandHandlerPort;