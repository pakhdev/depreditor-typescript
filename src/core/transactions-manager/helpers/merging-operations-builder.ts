import { Operation } from '../operation.ts';

export class MergingOperationsBuilder {

    constructor() {
        // Buscar las operaciones de inserción de elementos
        // Identificar el elemento insertable y comprobar si es mergeable

        // Opción 1: Si el elemento anterior es del mismo tipo - modificar las rutas de inserción para que los
        // elementos se añadan al final del elemento anterior
        // Opción 2: Si el elemento posterior es del mismo tipo - modificar las rutas de inserción para que los
        // elementos se añadan al principio del elemento posterior

        // Redireccionar las inserciones en este elemento

        // Eliminar la inserción del nodo actual ya que no será necesario
    }

    private static redirectInsertions(parentPath: number[], newParentPath: number[], position: 'start' | 'end'): void {
        // Buscar todas las inserciones en la ruta indicada
        // Organizar las operaciones
        // Decidir la posición inicial que se asignará a las operaciones
        // Reasignar las rutas
    }

    private static orderInsertions(operations: Operation[]): Operation[] {
        // Comprobar si todas las operaciones son del mismo nodo padre
        // Organizar las operaciones por el último digito de la ruta
    }

}