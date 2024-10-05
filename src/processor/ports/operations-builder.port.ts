import SelectionWorkspace from '../selection-workspace/selection-workspace.ts';
import Operation from '../../core/transactions-manager/operation.ts';
import OperationsBuilder from '../utilities/operations-builder/operations-builder.ts';

class OperationsBuilderPort {
    public static injectText(selectionWorkspace: SelectionWorkspace, text: string): Operation {
        return new OperationsBuilder(selectionWorkspace).injectText(text);
    }

    public static injectNodes(selectionWorkspace: SelectionWorkspace, newNodes: Node[]): Operation[] {
        return new OperationsBuilder(selectionWorkspace).injectNodes(newNodes);
    }

    public static removeSelectedNodes(selectionWorkspace: SelectionWorkspace): Operation[] {
        return new OperationsBuilder(selectionWorkspace).removeSelectedNodes();
    }
}

export default OperationsBuilderPort;