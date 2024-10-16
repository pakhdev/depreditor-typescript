import SelectionWorkspace from '../../selection-workspace/selection-workspace.ts';
import SelectedElement from '../../../core/selection/helpers/selected-element.ts';
import Operation from '../../../core/transactions-manager/operation.ts';
import OperationType from '../../../core/transactions-manager/enums/operation-type.enum.ts';

class OperationsBuilder {

    private injectedElements: number = 0;

    constructor(private readonly selectionWorkspace: SelectionWorkspace) {}

    public injectText(text: string): Operation[] {
        const { commonAncestorPath, editableDiv, isTextNode, offset } = this.getSelectionProperties();
        if (!isTextNode)
            throw new Error('Solo se puede inyectar texto en un nodo de texto');

        const targetElement = new SelectedElement(editableDiv, [...commonAncestorPath], offset);
        return [new Operation(OperationType.TEXT_INJECTION, targetElement, text)];
    }

    public injectNodes(newNodes: Node[]): Operation[] {
        const { startIdx, commonAncestorPath, editableDiv } = this.getSelectionProperties();
        return newNodes.map((node) => {
            this.injectedElements++;
            const targetElement = new SelectedElement(editableDiv, [...commonAncestorPath, startIdx + this.injectedElements]);
            return new Operation(OperationType.ELEMENT_INJECTION, targetElement, node);
        });
    }

    public removeSelected(forceNodeRemoval: boolean = false): Operation[] {
        const {
            startIdx,
            endIdx,
            commonAncestorPath,
            offset,
            editableDiv,
            isTextNode,
            isNothingSelected,
        } = this.getSelectionProperties();

        if (isNothingSelected) {
            if (forceNodeRemoval) {
                const targetPath = isTextNode ? [...commonAncestorPath] : [...commonAncestorPath, startIdx];
                return [new Operation(OperationType.ELEMENT_REMOVAL, new SelectedElement(editableDiv, targetPath))];
            }
            return [];
        }
        if (isTextNode)
            return [new Operation(OperationType.TEXT_REMOVAL, new SelectedElement(editableDiv, [...commonAncestorPath], offset))];

        return Array.from({ length: endIdx - startIdx }, (_, i) => {
            const targetElement = new SelectedElement(editableDiv, [...commonAncestorPath, startIdx + i]);
            return new Operation(OperationType.ELEMENT_REMOVAL, targetElement);
        });
    }

    private getSelectionProperties() {
        const {
            startIndexInCommonAncestor: startIdx,
            endIndexInCommonAncestor: endIdx,
            commonAncestor: { path: commonAncestorPath, isTextNode, offset },
            isNothingSelected,
            editableDiv,
        } = this.selectionWorkspace.selection;
        return { startIdx, endIdx, commonAncestorPath, offset, editableDiv, isTextNode, isNothingSelected };
    }
}

export default OperationsBuilder;