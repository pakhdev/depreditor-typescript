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

    private static findChildOperations(parentPath: number[], transaction: Transaction) {

    }

    private static findOperations(where: {
        type?: OperationType,
        parentPath?: number[],
    }): Operation[] {

    }

    private static willBeEmpty(elementPath: number[], transaction: Transaction): boolean {

    }

    private static willBeDeleted(elementPath: number[], transaction: Transaction): boolean {

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