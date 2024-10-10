import DeferredSelection from '../../../core/transactions-manager/interfaces/deferred-selection.interface.ts';
import Operation from '../../../core/transactions-manager/operation.ts';
import OperationType from '../../../core/transactions-manager/enums/operation-type.enum.ts';
import SelectedElement from '../../../core/selection/helpers/selected-element.ts';

class DeferredSelectionBuilder {

    public static beforeFragment(operations: Operation[]): DeferredSelection {
        const firstElementPosition = this.getFirstPosition(operations);

        if (operations.length === 1 && operations[0].type === OperationType.TEXT_REMOVAL)
            return { type: 'caret', path: firstElementPosition.path, offset: firstElementPosition.offset.start };

        return { type: 'before', path: firstElementPosition.path };
    }

    public static afterFragment(operations: Operation[]): DeferredSelection {
        const lastElementPosition = this.getLastPosition(operations);

        if (operations.length === 1 && operations[0].type === OperationType.TEXT_INJECTION) {
            const textLength = operations[0].textToInject!.length;
            const offset = lastElementPosition.offset.start + textLength;
            return { type: 'caret', path: lastElementPosition.path, offset };
        }

        return { type: 'after', path: lastElementPosition.path };
    }

    public static insideFragment(operations: Operation[]): DeferredSelection {
        return { type: 'inside', path: this.getFirstTextNodePath(operations) };
    }

    public static entireFragment(operations: Operation[]): DeferredSelection {
        return {
            type: 'range',
            startPath: this.getInsertionPointPath(operations, 'ASC'),
            endPath: this.getInsertionPointPath(operations, 'DESC'),
        };
    }

    // Busca el primer elemento insertado de las operaciones
    private static getFirstPosition(operations: Operation[]): SelectedElement {
        return this.getTopLevelOperations(operations)[0].position;
    }

    // Busca el último elemento insertado de las operaciones
    private static getLastPosition(operations: Operation[]): SelectedElement {
        return this.getTopLevelOperations(operations).slice(-1)[0].position;
    }

    // Busca el primer nodo de texto de las operaciones
    private static getFirstTextNodePath(operations: Operation[]): number[] {
        const topLevelOperations = this.getTopLevelOperations(operations);
        for (const operation of topLevelOperations) {
            if (!operation.elementToInject)
                throw new Error('Elemento a insertar no definido');
            const textNodePath = this.findTextNodePath(operation.elementToInject, operation.position.path);
            if (textNodePath) return textNodePath;
        }
        throw new Error('No se encontró ningún elemento de texto');
    }

    // Busca un punto donde se pueda insertar la selección, dependiendo del argumento 'order' encontrará el primer o último punto
    private static getInsertionPointPath(operations: Operation[], order: 'ASC' | 'DESC'): number[] {
        let topLevelOperations = this.getTopLevelOperations(operations);
        if (order === 'DESC')
            topLevelOperations = topLevelOperations.reverse();

        for (const operation of topLevelOperations) {
            if (!operation.elementToInject)
                throw new Error('Elemento a insertar no definido');
            if (this.isValidInsertionPoint(operation.elementToInject))
                return operation.position.path;
            if (operation.elementToInject.hasChildNodes()) {
                const validChildPath = this.findChildInsertionPointPath(operation.elementToInject, operation.position.path, order);
                if (validChildPath)
                    return validChildPath;
            }
        }
        throw new Error('No se encontró ningún punto de inserción válido');
    }

    private static getTopLevelOperations(operations: Operation[]): Operation[] {
        if (!operations.length)
            throw new Error('No hay operaciones para extraer');

        const minPathLength = Math.min(...operations.map(op => op.position.path.length));
        return operations
            .filter(op => op.position.path.length === minPathLength)
            .sort((a, b) => a.position.position - b.position.position);
    }

    private static findTextNodePath(parent: Node, path: number[]): number[] | null {
        for (let i = 0; i < parent.childNodes.length; i++) {
            const child = parent.childNodes[i];
            if (child.nodeType === Node.TEXT_NODE)
                return path.concat(i);
            const result = this.findTextNodePath(child, path.concat(i));
            if (result)
                return result;
        }
        return null;
    }

    private static findChildInsertionPointPath(parent: Node, path: number[], order: 'ASC' | 'DESC'): number[] | null {
        let children = Array.from(parent.childNodes);
        if (order === 'DESC')
            children = children.reverse();
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (this.isValidInsertionPoint(child))
                return path.concat(i);
            if (child.hasChildNodes()) {
                const result = this.findChildInsertionPointPath(child, path.concat(i), order);
                if (result)
                    return result;
            }
        }
        return null;
    }

    private static isValidInsertionPoint(node: Node): boolean {
        return node.nodeType === Node.TEXT_NODE || node.childNodes.length === 0;
    }

}

export default DeferredSelectionBuilder;