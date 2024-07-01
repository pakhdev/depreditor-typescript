import { Transaction } from '../transaction.ts';
import { OperationType } from '../enums/operation-type.enum.ts';
import { Operation } from '../operation.ts';

// Clase que se encarga de limpiar los nodos vacíos y las operaciones innecesarias
export class CleaningOperationsBuilder {

    public static build(transaction: Transaction): void {
        this.convertTextToElementRemoval(transaction);
        this.addDeletionForEmptyNodes(transaction);
        this.cleanupChildDeletions(transaction);
    }

    // Encontrar operaciones donde se elimina еl texto
    // Si se quedan sin texto sustituir la operación por una eliminación del elemento
    private static convertTextToElementRemoval(transaction: Transaction): void {

    }

    // Encontrar los nodos en los que se eliminarán todos los nodos hijos tras la transacción
    // Si su nodo padre NO se elimina en ésta transacción y en las propiedades del contenedor
    // no existe la propiedad keepIfEmpty - añadir la operación de eliminación del nodo
    private static addDeletionForEmptyNodes(transaction: Transaction): void {

    }

    // Eliminar las operaciones de eliminación de nodos hijos dentro de los nodos que ya serán eliminados
    private static cleanupChildDeletions(transaction: Transaction): void {

    }

    private static findChildOperations(transaction: Transaction, parentPath: number[]) {

    }

    private static findOperations(transaction: Transaction, where: {
        type?: OperationType,
        parentPath?: number[],
    }): Operation[] {
        const operations: Operation[] = [...transaction.operations];
        if (where.type !== undefined)
            operations.filter(operation => operation.type === where.type);
        if (where.parentPath !== undefined)
            operations.filter(operation => this.isDirectChild(where.parentPath, operation.path));
        return operations;
    }

    private static willBeEmpty(transaction: Transaction, node: Node, elementPath: number[]): boolean {
        if (node.nodeType === Node.TEXT_NODE) {
            const textRemovals = this.findOperations(transaction, { type: OperationType.TEXT_REMOVAL });
            for (const textRemoval of textRemovals) {
                if (textRemoval.position.path === elementPath) {
                    const textLength = node.textContent?.length;
                    return textRemoval.position.offset.end === textLength && textRemoval.position.offset.start === 0;
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const childRemovals = this.findOperations(transaction, {
                type: OperationType.ELEMENT_REMOVAL,
                parentPath: elementPath,
            });
            const childInjections = this.findOperations(transaction, {
                type: OperationType.ELEMENT_INJECTION,
                parentPath: elementPath,
            });
            const originalChildrenCount = node.childNodes.length;
            return originalChildrenCount - childRemovals.length + childInjections.length > 0;
        }

        return false;
    }

    private static willBeDeleted(transaction: Transaction, elementPath: number[]): boolean {
        return transaction.operations.some(
            operation => operation.type === OperationType.ELEMENT_REMOVAL && operation.position.path === elementPath,
        );
    }

    private static isDirectChild(parentPath: number[], elementPath: number[]): boolean {
        if (elementPath.length !== parentPath.length + 1)
            return false;

        for (let i = 0; i < parentPath.length; i++)
            if (operationPath[i] !== parentPath[i])
                return false;

        return true;
    }

}