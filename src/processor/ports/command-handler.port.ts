import CommandHandler from '../command-handler/command-handler.ts';
import Core from '../../core/core.ts';
import Processor from '../processor.ts';
import HandlingContext from '../command-handler/interfaces/handling-context.interface.ts';

class CommandHandlerPort {

    private commandHandler: CommandHandler;

    constructor(
        private readonly core: Core,
        private readonly processor: Processor,
    ) {
        this.commandHandler = new CommandHandler(this.core, this.processor);
    }

    public insertNodes(newNodes: Node[], handlingContext?: HandlingContext): void {
        return this.commandHandler.insertNodes(newNodes, handlingContext);
    }

    public insertText(text: string): void {
        return this.commandHandler.insertText(text);
    }

    public handleInsertion(input: Node[] | string, handlingContext?: HandlingContext): void {
        return this.commandHandler.handleInsertion(input, handlingContext);
    }

    public handleElement(node: Node): void {
        return this.commandHandler.handleElement(node);
    }

    public handleDeletion(): void {
        return this.commandHandler.handleDeletion();
    }

    public deleteSelectedContent(): void {
        return this.commandHandler.deleteSelectedContent();
    }
}

export default CommandHandlerPort;