import { CleaningOperationsBuilder } from './helpers/cleaning-operations-builder.ts';
import { MergingOperationsBuilder } from './helpers/merging-operations-builder.ts';
import { Selection } from '../selection/selection.ts';
import { Transaction } from './transaction.ts';

export class TransactionsManager {

    private transactionsHistory: Transaction[] = [];
    private currentTransactionIndex = -1;

    constructor(private readonly selection: Selection) {}

    public commit(transaction: Transaction): void {
        MergingOperationsBuilder.build(transaction);
        CleaningOperationsBuilder.build(transaction);
        this.purgeFutureTransactions();
        this.transactionsHistory.push(transaction);
        this.redo();
    }

    public redo(): void {
        if (this.transactionsHistory.length > this.currentTransactionIndex + 1) {
            this.currentTransactionIndex++;
            this.transactionsHistory[this.currentTransactionIndex].execute(this.selection);
        }
    }

    public undo(): void {
        if (this.currentTransactionIndex >= 0) {
            this.transactionsHistory[this.currentTransactionIndex].undo(this.selection);
            this.currentTransactionIndex--;
        }
    }

    private purgeFutureTransactions(): void {
        if (this.currentTransactionIndex < this.transactionsHistory.length - 1)
            this.transactionsHistory = this.transactionsHistory.slice(0, this.currentTransactionIndex + 1);
    }

}