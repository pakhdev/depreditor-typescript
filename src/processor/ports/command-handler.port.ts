import CommandHandler from '../command-handler/command-handler.ts';
import Core from '../../core/core.ts';
import Processor from '../processor.ts';
import TransactionBuilder from '../../core/transactions-manager/helpers/transaction-builder.ts';

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

    public handleInsertion(input: Node[] | string, transactionBuilder?: TransactionBuilder): void {
        return this.commandHandler.handleInsertion(input, transactionBuilder);
    }

    public handleElement(node: Node): void {
        return this.commandHandler.handleElement(node);
    }

    public handleDeletion(): void {
        return this.commandHandler.handleDeletion();
    }
}

export default CommandHandlerPort;