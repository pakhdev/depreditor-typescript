import Operation from './operation.ts';
import OperationType from './enums/operation-type.enum.ts';
import Selection from '../selection/selection';
import StoredSelection from '../selection/helpers/stored-selection.ts';

class Transaction {

    constructor(
        public operations: Operation[],
        public readonly ownerEditor: HTMLDivElement,
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

    public findOperations(where: {
        type?: OperationType,
        parentPath?: number[],
    }): Operation[] {
        const operations: Operation[] = [...this.operations];
        if (where.type !== undefined)
            operations.filter(operation => operation.type === where.type);
        if (where.parentPath !== undefined)
            operations.filter(operation => this.isDirectChild(where.parentPath!, operation.position.path));
        return operations;
    }

    private isDirectChild(parentPath: number[], elementPath: number[]): boolean {
        if (elementPath.length !== parentPath.length + 1)
            return false;

        for (let i = 0; i < parentPath.length; i++)
            if (elementPath[i] !== parentPath[i])
                return false;

        return true;
    }

}

export default Transaction;