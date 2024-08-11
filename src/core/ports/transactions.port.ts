import TransactionsManager from '../transactions-manager/transactions-manager.ts';
import Transaction from '../transactions-manager/transaction.ts';
import TransactionBuilder from '../transactions-manager/helpers/transaction-builder.ts';
import SelectionWorkspace from '../../processor/selection-workspace/selection-workspace.ts';

class TransactionsPort {

    constructor(private readonly transactionsManager: TransactionsManager) {}

    public builder(workspace: SelectionWorkspace): TransactionBuilder {
        return new TransactionBuilder(workspace);
    }

    public commit(transaction: Transaction): void {
        this.transactionsManager.commit(transaction);
    }

    public undo(): void {
        this.transactionsManager.undo();
    }

    public redo(): void {
        this.transactionsManager.redo();
    }
}

export default TransactionsPort;