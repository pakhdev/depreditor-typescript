import { Selection } from '../selection/selection';
import { Operation } from './operation.ts';
import { StoredSelection } from '../selection/helpers/stored-selection.ts';

export class Transaction {

    constructor(
        public operations: Operation[],
        private readonly initialSelection: StoredSelection,
        private readonly finalSelection: StoredSelection,
    ) {}

    public execute(selection: Selection): void {
        for (const operation of this.operations)
            operation.execute();
        selection.set(this.finalSelection);
    }

    public undo(selection: Selection): void {
        const reversedOperations = [...this.operations.reverse()];
        for (const operation of reversedOperations)
            operation.undo();
        selection.set(this.initialSelection);
    }

    public addOperation(operation: Operation, insertAt?: number): number {
        if (insertAt === undefined) {
            this.operations.push(operation);
            return this.operations.length - 1;
        } else {
            this.operations.splice(insertAt, 0, operation);
            return insertAt;
        }
    }

    public removeOperation(operation: Operation): number {
        const index = this.operations.indexOf(operation);
        this.operations.splice(index, 1);
        return index;
    }
    
}