import Operation from '../operation.ts';
import SelectionWorkspace from '../../../processor/selection-workspace/selection-workspace.ts';
import StoredSelection from '../../selection/helpers/stored-selection.ts';
import Transaction from '../transaction.ts';
import DeferredSelection from '../interfaces/deferred-selection.interface.ts';
import DeferredSelectionType from '../enums/deferred-selection-type.enum.ts';
import DeferredSelectionBuilder
    from '../../../processor/utilities/deferred-selection-builder/deferred-selection-builder.ts';

class TransactionBuilder {

    private readonly removalOperations: Operation[] = [];
    private readonly injectingOperations: Operation[] = [];
    private readonly initialSelection: StoredSelection;
    private deferredSelection: DeferredSelection | null = null;

    constructor(private workspace: SelectionWorkspace) {
        this.initialSelection = workspace.selection;
    }

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

    public computeDeferredSelection(operations: Operation[], deferredSelectionType: DeferredSelectionType): TransactionBuilder {
        switch (deferredSelectionType) {
            case DeferredSelectionType.BEFORE_FRAGMENT:
                this.deferredSelection = DeferredSelectionBuilder.beforeFragment(operations);
                break;
            case DeferredSelectionType.INSIDE_FRAGMENT:
                this.deferredSelection = DeferredSelectionBuilder.insideFragment(operations);
                break;
            case DeferredSelectionType.AFTER_FRAGMENT:
                this.deferredSelection = DeferredSelectionBuilder.afterFragment(operations);
                break;
            case DeferredSelectionType.ENTIRE_FRAGMENT:
                this.deferredSelection = DeferredSelectionBuilder.entireFragment(operations);
                break;
        }
        return this;
    }

    public setDeferredSelection(deferredSelection: DeferredSelection): TransactionBuilder {
        this.deferredSelection = deferredSelection;
        return this;
    }

    public build(): Transaction {
        if (this.initialSelection === null || this.deferredSelection === null)
            throw new Error('La selección inicial y final deben ser definidas antes de crear la transacción');

        const operationsList = [...this.removalOperations, ...this.injectingOperations];
        return new Transaction(
            operationsList,
            this.workspace.selection.editableDiv,
            this.initialSelection,
            this.deferredSelection,
        );
    }
}

export default TransactionBuilder;
