import { ContainerIdentifier } from '../../containers/identifier.ts';
import { Operation } from '../operation.ts';
import { OperationType } from '../enums/operation-type.enum.ts';
import { ParentWithRemovals } from '../interfaces/parent-with-removals.interface.ts';
import { SelectedElement } from '../../selection/helpers/selected-element.ts';
import { Transaction } from '../transaction.ts';

// La clase se encarga de limpiar los nodos vacíos y las operaciones innecesarias
export class CleaningOperationsBuilder {

    public static build(transaction: Transaction): void {
        // Eliminar los nodos de texto que se quedarán vacíos
        const textNodesWithRemovals = transaction.findOperations({ type: OperationType.TEXT_REMOVAL });
        this.convertTextToElementRemoval(transaction, textNodesWithRemovals);

        // Eliminar los contenedores que se quedarán vacíos
        let parentNodesWithRemovals = this.findParentsWithElementRemovals(transaction);
        this.addDeletionForEmptyNodes(transaction, parentNodesWithRemovals);

        // Eliminar las operaciones de eliminación de nodos hijos dentro de los nodos que ya serán eliminados
        parentNodesWithRemovals = this.findParentsWithElementRemovals(transaction);
        this.cleanupChildDeletions(transaction, parentNodesWithRemovals);
    }

    private static convertTextToElementRemoval(transaction: Transaction, textRemovals: Operation[]): void {
        for (const textRemoval of textRemovals) {
            if (this.willBeEmpty(transaction, textRemoval.position.node, textRemoval.position.path))
                textRemoval.type = OperationType.ELEMENT_REMOVAL;
        }
    }

    private static addDeletionForEmptyNodes(transaction: Transaction, parentsWithRemovals: ParentWithRemovals[]): void {
        for (const parent of parentsWithRemovals) {
            const containerType = ContainerIdentifier.identify(parent.node as HTMLElement);
            if (containerType && containerType.keepIfEmpty || this.willBeDeleted(transaction, parent.path))
                continue;
            const newElementRemoval = new Operation(
                OperationType.ELEMENT_REMOVAL,
                new SelectedElement(transaction.ownerEditor, parent.node, { start: 0 }),
            );
            transaction.addOperation(newElementRemoval, parent.firstRemovalIdx);
        }

    }

    private static cleanupChildDeletions(transaction: Transaction, parentsWithRemovals: ParentWithRemovals[]): void {
        for (const parent of parentsWithRemovals) {
            if (!this.willBeEmpty(transaction, parent.node, parent.path))
                continue;
            const removalOperations = transaction.findOperations({
                type: OperationType.ELEMENT_REMOVAL,
                parentPath: parent.path,
            });
            removalOperations.forEach(operation => transaction.removeOperation(operation));
        }
    }

    private static findParentsWithElementRemovals(transaction: Transaction): ParentWithRemovals[] {
        const parents: ParentWithRemovals[] = [];

        const elementRemovals = transaction.findOperations({ type: OperationType.ELEMENT_REMOVAL });
        for (const elementRemoval of elementRemovals) {
            const parentPath = elementRemoval.position.path.slice(0, -1);
            if (!parents.some(parent => JSON.stringify(parent.path) === JSON.stringify(parentPath))) {
                parents.push({
                    node: elementRemoval.position.parentNode,
                    path: parentPath,
                    firstRemovalIdx: elementRemovals.indexOf(elementRemoval),
                });
            }
        }

        return parents;
    }

    private static willBeEmpty(transaction: Transaction, node: Node, elementPath: number[]): boolean {
        if (node.nodeType === Node.TEXT_NODE) {
            const textRemovals = transaction.findOperations({ type: OperationType.TEXT_REMOVAL });
            for (const textRemoval of textRemovals) {
                if (textRemoval.position.path === elementPath) {
                    const textLength = node.textContent?.length;
                    return textRemoval.position.offset.end === textLength && textRemoval.position.offset.start === 0;
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const childRemovals = transaction.findOperations({
                type: OperationType.ELEMENT_REMOVAL,
                parentPath: elementPath,
            });
            const childInjections = transaction.findOperations({
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

}