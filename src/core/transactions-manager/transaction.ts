import { Selection } from '../selection/selection';
import { Operation } from './operation.ts';
import { StoredSelection } from '../selection/helpers/stored-selection.ts';

export class Transaction {

    constructor(
        public operations: Operation[],
        private readonly initialSelection: StoredSelection,
        private readonly finalSelection: StoredSelection,
    ) {}

    execute(selection: Selection): void {
        for (const operation of this.operations)
            operation.execute();
        selection.set(this.finalSelection);
    }

    undo(selection: Selection): void {
        const reversedOperations = [...this.operations.reverse()];
        for (const operation of reversedOperations)
            operation.undo();
        selection.set(this.initialSelection);
    }
}