import Operation from '../operation.ts';
import SelectionWorkspace from '../../../processor/selection-workspace/selection-workspace.ts';
import StoredSelection from '../../selection/helpers/stored-selection.ts';
import Transaction from '../transaction.ts';

class TransactionBuilder {

    private readonly removalOperations: Operation[] = [];
    private readonly injectingOperations: Operation[] = [];
    private initialSelection: StoredSelection | null = null;
    private finalSelection: StoredSelection | null = null;

    constructor(private workspace: SelectionWorkspace) {}

    public appendInjections(operations: Operation | Operation[]): TransactionBuilder {
        Array.isArray(operations)
            ? this.injectingOperations.push(...operations)
            : this.injectingOperations.push(operations);
        return this;
    }

    public appendRemovals(operations: Operation[]): TransactionBuilder {
        this.removalOperations.push(...operations);
        return this;
    }

    public setInitialSelection(selection: StoredSelection): TransactionBuilder {
        this.initialSelection = selection;
        return this;
    }

    public build(): Transaction {
        if (this.initialSelection === null || this.finalSelection === null)
            throw new Error('La selección inicial y final deben ser definidas antes de crear la transacción');

        const operationsList = [...this.removalOperations, ...this.injectingOperations];
        return new Transaction(
            operationsList,
            this.workspace.selection.editableDiv,
            this.initialSelection,
            this.finalSelection,
        );
    }

    public test(): void {
        console.log('Injecting ops:', this.injectingOperations);
    }
}

export default TransactionBuilder;
