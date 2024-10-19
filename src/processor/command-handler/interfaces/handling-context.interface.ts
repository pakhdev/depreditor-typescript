import SelectionWorkspace from '../../selection-workspace/selection-workspace.ts';
import TransactionBuilder from '../../../core/transactions-manager/helpers/transaction-builder.ts';

interface HandlingContext {
    workspace?: SelectionWorkspace;
    indentation?: number;
    transactionBuilder?: TransactionBuilder;
};

export default HandlingContext;