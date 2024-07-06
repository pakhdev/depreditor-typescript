import { Operation } from '../operation.ts';
import { Transaction } from '../transaction.ts';
import { OperationType } from '../enums/operation-type.enum.ts';
import { ContainerIdentifier } from '../../containers/identifier.ts';
import { RedirectArgs } from '../interfaces/redirect-args.interface.ts';
import { ContainerProperties } from '../../containers/interfaces/container-properties.interface.ts';
import { RedirectEntry } from '../interfaces/redirect-entry.interface.ts';

export class MergingOperationsBuilder {

    public static build(transaction: Transaction) {

        const requiredRedirects = this.findRequiredRedirects(transaction);

        // Opción 1: Si el elemento anterior es del mismo tipo - modificar las rutas de inserción para que los
        // elementos se añadan al final del elemento anterior
        // Opción 2: Si el elemento posterior es del mismo tipo - modificar las rutas de inserción para que los
        // elementos se añadan al principio del elemento posterior

        // Redireccionar las inserciones en este elemento

        // Eliminar la inserción del nodo actual ya que no será necesario
    }

    private static redirectInsertions(args: RedirectArgs): void {
        // Buscar todas las inserciones en la ruta indicada
        // Organizar las operaciones
        // Decidir la posición inicial que se asignará a las operaciones
        // Reasignar las rutas
    }

    private static orderInsertions(operations: Operation[]): Operation[] {
        // Comprobar si todas las operaciones son del mismo nodo padre
        // Organizar las operaciones por el último digito de la ruta
    }

    private static findRequiredRedirects(transaction: Transaction): RedirectEntry[] {
        const redirects: { operation: Operation, redirect: RedirectArgs }[] = [];

        const injectionOperations = transaction.findOperations({ type: OperationType.ELEMENT_INJECTION });
        for (const operation of injectionOperations) {
            const elementToInject = operation.elementToInject;
            if (!elementToInject)
                throw new Error('Elemento a insertar no definido');

            const containerType = ContainerIdentifier.identify(operation.elementToInject as HTMLElement);
            if (!containerType || !containerType.mergeable)
                continue;
            const compatibleSibling = this.findCompatibleSibling(operation, containerType);
            if (compatibleSibling)
                redirects.push({ operation, redirect: compatibleSibling });
        }
        return redirects;
    }

    private static findCompatibleSibling(operation: Operation, referenceType: ContainerProperties): RedirectArgs | null {
        const previousSibling = operation.position.previousSibling;
        if (previousSibling && this.checkSibling(previousSibling.node, referenceType))
            return {
                parentPath: operation.position.path,
                newParentPath: previousSibling.path,
                position: 'end',
            };

        const nextSibling = operation.position.nextSibling;
        if (nextSibling && this.checkSibling(nextSibling.node, referenceType))
            return {
                parentPath: operation.position.path,
                newParentPath: nextSibling.path,
                position: 'start',
            };

        return null;
    }

    private static checkSibling(node: Node, referenceType: ContainerProperties): boolean {
        const containerType = ContainerIdentifier.identify(node as HTMLElement);
        return !!containerType && containerType === referenceType;
    }

}