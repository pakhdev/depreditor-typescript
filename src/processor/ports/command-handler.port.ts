import CommandHandler from '../command-handler/command-handler.ts';
import Core from '../../core/core.ts';
import Processor from '../processor.ts';
import Operation from '../../core/transactions-manager/operation.ts';

class CommandHandlerPort {

    private commandHandler: CommandHandler;

    constructor(
        private readonly core: Core,
        private readonly processor: Processor,
    ) {
        this.commandHandler = new CommandHandler(this.core, this.processor);
    }

    public insertNodes(newNodes: Node[]): void {
        return this.commandHandler.insertNodes(newNodes);
    }

    public insertText(text: string): void {
        return this.commandHandler.insertText(text);
    }

    public handleInsertion(
        input: Node[] | string,
        additionalInjections: Operation[] = [],
        additionalRemovals: Operation[] = [],
    ): void {
        return this.commandHandler.handleInsertion(input, additionalInjections, additionalRemovals);
    }

    public handleElement(node: Node): void {
        return this.commandHandler.handleElement(node);
    }

    public deleteSelectedContent(): void {
        return this.commandHandler.deleteSelectedContent();
    }
}

export default CommandHandlerPort;