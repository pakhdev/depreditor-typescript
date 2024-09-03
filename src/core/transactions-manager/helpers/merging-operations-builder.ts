import ContainerIdentifier from '../../containers/identifier.ts';
import ContainerProperties from '../../containers/interfaces/container-properties.interface.ts';
import Operation from '../operation.ts';
import OperationType from '../enums/operation-type.enum.ts';
import RedirectArgs from '../interfaces/redirect-args.interface.ts';
import RedirectEntry from '../interfaces/redirect-entry.interface.ts';
import Transaction from '../transaction.ts';

class MergingOperationsBuilder {

    // TODO: Probablemente hay que analizar los elementos
    //  inyectados que se encuentran en el mismo nivel también

    public static build(transaction: Transaction): void {
        const requiredRedirects = this.findRequiredRedirects(transaction);
        for (const redirect of requiredRedirects) {
            let childInjections = transaction.findOperations({
                type: OperationType.ELEMENT_INJECTION,
                parentPath: redirect.operation.position.path,
            });
            childInjections = this.orderByPosition(childInjections);
            this.redirectInjections(childInjections, redirect.data);
            transaction.removeOperation(redirect.operation);
        }
    }

    private static redirectInjections(operations: Operation[], args: RedirectArgs): void {
        let position = args.startPosition;
        const referenceParentPath = JSON.stringify(args.newParentPath.slice(0, -1));
        for (const operation of operations) {
            if (JSON.stringify(operation.position.path.slice(0, -1)) !== referenceParentPath)
                throw new Error('La operación no tiene la misma ruta padre que el redireccionamiento');
            operation.position.path = [...args.newParentPath, position];
            position++;
        }
    }

    private static orderByPosition(operations: Operation[]): Operation[] {
        if (operations.length === 0)
            return operations;

        if (!this.checkPathConsistency(operations))
            throw new Error('Las operaciones no tienen la misma ruta padre');

        return operations.sort((a, b) => a.position.position - b.position.position);
    }

    private static findRequiredRedirects(transaction: Transaction): RedirectEntry[] {
        const redirects: { operation: Operation, data: RedirectArgs }[] = [];

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
                redirects.push({ operation, data: compatibleSibling });
        }
        return redirects;
    }

    private static findCompatibleSibling(operation: Operation, referenceType: ContainerProperties): RedirectArgs | null {
        const previousSibling = operation.position.previousSibling;
        if (previousSibling && this.checkSibling(previousSibling.node, referenceType))
            return {
                parentPath: operation.position.path,
                newParentPath: previousSibling.path,
                startPosition: previousSibling.node.childNodes.length,
            };

        const nextSibling = operation.position.nextSibling;
        if (nextSibling && this.checkSibling(nextSibling.node, referenceType))
            return {
                parentPath: operation.position.path,
                newParentPath: nextSibling.path,
                startPosition: 0,
            };

        return null;
    }

    // Comprueba si el nodo es un contenedor del tipo especificado
    private static checkSibling(node: Node, referenceType: ContainerProperties): boolean {
        const containerType = ContainerIdentifier.identify(node as HTMLElement);
        return !!containerType && containerType === referenceType;
    }

    private static checkPathConsistency(operations: Operation[]): boolean {
        if (operations.length === 0)
            return true;
        const referenceLength = operations[0].position.path.length;
        const referenceParentPath = JSON.stringify(operations[0].position.path.slice(0, -1));
        return operations.every(operation =>
            operation.position.path.length === referenceLength
            && JSON.stringify(operation.position.path.slice(0, -1)) === referenceParentPath,
        );
    }

}

export default MergingOperationsBuilder;