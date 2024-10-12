import Processor from '../../../processor/processor.ts';
import HookHandler from '../../../core/event-hooks/interfaces/hook-handler.interface.ts';
import SelectionWorkspace from '../../../processor/selection-workspace/selection-workspace.ts';
import SelectionStateType from '../../../core/selection/enums/selection-state-type.enum.ts';
import OperationsBuilder from '../../../processor/utilities/operations-builder/operations-builder.ts';
import AffectedNodesPart from '../../../core/selection/enums/affected-nodes-part.enum.ts';

const internalDrop: HookHandler = (event?: Event, processor?: Processor): void => {
    if (!event || !processor) throw new Error('Internal drag: El evento o el procesador no están definidos');

    const e = event as DragEvent;
    e.preventDefault();

    const previousSelectionWorkspace = new SelectionWorkspace(processor.core, SelectionStateType.PREVIOUS);
    const operationsBuilder = new OperationsBuilder(previousSelectionWorkspace);
    const transactionBuilder = processor.core.transactions.builder(previousSelectionWorkspace);
    const selectedPart = previousSelectionWorkspace.cloneFragment.selectedPart(AffectedNodesPart.WITHIN).nodes;

    if (!previousSelectionWorkspace.selection.commonAncestor.isTextNode)
        transactionBuilder.appendInjections(operationsBuilder.injectNodes([
            ...previousSelectionWorkspace.cloneFragment.selectedPart(AffectedNodesPart.BEFORE).nodes,
            ...previousSelectionWorkspace.cloneFragment.selectedPart(AffectedNodesPart.AFTER).nodes,
        ]));

    transactionBuilder.appendRemovals(operationsBuilder.removeSelected());

    processor.commandHandler.handleInsertion(selectedPart, transactionBuilder);
};

export default internalDrop;