import Operation from '../operation.ts';
import OperationType from '../enums/operation-type.enum.ts';
import SelectedElement from '../../selection/helpers/selected-element.ts';
import SelectionWorkspace from '../../../processor/selection-workspace/selection-workspace.ts';
import StoredSelection from '../../selection/helpers/stored-selection.ts';
import Transaction from '../transaction.ts';

class TransactionBuilder {

    private removalOperations: Operation[] = [];
    private injectingOperations: Operation[] = [];
    private initialSelection: StoredSelection | null = null;
    private finalSelection: StoredSelection | null = null;

    // Target elements to select?

    constructor(private workspace: SelectionWorkspace) {}

    public createRemovalOps(): TransactionBuilder {
        const { startIndexInCommonAncestor: startIdx, endIndexInCommonAncestor: endIdx } = this.workspace.selection;
        const { path: commonAncestorPath } = this.workspace.selection.commonAncestor;
        const { editableDiv } = this.workspace.selection;

        for (let i = startIdx; i <= endIdx; i++) {
            const targetElement = new SelectedElement(editableDiv, [...commonAncestorPath, i]);
            this.removalOperations.push(new Operation(OperationType.ELEMENT_REMOVAL, targetElement));
        }
        return this;
    }

    public createInjectingOps(newNodes: Node[]): TransactionBuilder {
        const { startIndexInCommonAncestor: startIdx } = this.workspace.selection;
        const { path: commonAncestorPath } = this.workspace.selection.commonAncestor;
        const { editableDiv } = this.workspace.selection;

        for (let i = startIdx; i < startIdx + newNodes.length; i++) {
            const targetElement = new SelectedElement(editableDiv, [...commonAncestorPath, i]);
            this.injectingOperations.push(new Operation(OperationType.ELEMENT_INJECTION, targetElement, newNodes[i - startIdx]));
        }
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
}

export default TransactionBuilder;
