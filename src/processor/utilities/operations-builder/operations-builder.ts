import SelectionWorkspace from '../../selection-workspace/selection-workspace.ts';
import SelectedElement from '../../../core/selection/helpers/selected-element.ts';
import Operation from '../../../core/transactions-manager/operation.ts';
import OperationType from '../../../core/transactions-manager/enums/operation-type.enum.ts';

class OperationsBuilder {

    constructor(private readonly selectionWorkspace: SelectionWorkspace) {}

    public injectText(text: string): Operation {
        const { commonAncestorPath, editableDiv, isTextNode } = this.getSelectionProperties();
        if (!isTextNode)
            throw new Error('Solo se puede inyectar texto en un nodo de texto');

        const targetElement = new SelectedElement(editableDiv, [...commonAncestorPath]);
        return new Operation(OperationType.TEXT_INJECTION, targetElement, text);
    }

    public injectNodes(newNodes: Node[]): Operation[] {
        const { startIdx, commonAncestorPath, editableDiv } = this.getSelectionProperties();
        return newNodes.map((node, i) => {
            const targetElement = new SelectedElement(editableDiv, [...commonAncestorPath, startIdx + i]);
            return new Operation(OperationType.ELEMENT_INJECTION, targetElement, node);
        });
    }

    public removeSelected(): Operation[] {
        const {
            startIdx,
            endIdx,
            commonAncestorPath,
            offset,
            editableDiv,
            isTextNode,
            isSomethingSelected,
        } = this.getSelectionProperties();
        if (isTextNode && isSomethingSelected)
            return [new Operation(OperationType.TEXT_REMOVAL, new SelectedElement(editableDiv, [...commonAncestorPath], offset))];

        return Array.from({ length: endIdx - startIdx + 1 }, (_, i) => {
            const targetElement = new SelectedElement(editableDiv, [...commonAncestorPath, startIdx + i]);
            return new Operation(OperationType.ELEMENT_REMOVAL, targetElement);
        });
    }

    private getSelectionProperties() {
        const {
            startIndexInCommonAncestor: startIdx,
            endIndexInCommonAncestor: endIdx,
            commonAncestor: { path: commonAncestorPath, isTextNode, offset },
            isSomethingSelected,
            editableDiv,
        } = this.selectionWorkspace.selection;
        return { startIdx, endIdx, commonAncestorPath, offset, editableDiv, isTextNode, isSomethingSelected };
    }
}

export default OperationsBuilder;