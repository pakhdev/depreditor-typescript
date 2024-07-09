import TransactionsManager from '../transactions-manager/transactions-manager.ts';
import Transaction from '../transactions-manager/transaction.ts';

class TransactionsPort {

    constructor(private readonly transactionsManager: TransactionsManager) {}

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