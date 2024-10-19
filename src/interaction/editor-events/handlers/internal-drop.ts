import Processor from '../../../processor/processor.ts';
import SelectionWorkspace from '../../../processor/selection-workspace/selection-workspace.ts';
import SelectionStateType from '../../../core/selection/enums/selection-state-type.enum.ts';
import OperationsBuilder from '../../../processor/utilities/operations-builder/operations-builder.ts';
import AffectedNodesPart from '../../../core/selection/enums/affected-nodes-part.enum.ts';
import EditorEventHandler from '../interfaces/editor-event-handler.interface.ts';
import HandlingContext from '../../../processor/command-handler/interfaces/handling-context.interface.ts';
import Interaction from '../../interaction.ts';

const internalDrop: EditorEventHandler = (event: Event, processor: Processor, _: Interaction, handlingContext: HandlingContext): void => {
    const e = event as DragEvent;
    e.preventDefault();

    const previousSelectionWorkspace = new SelectionWorkspace(processor.core, SelectionStateType.PREVIOUS);
    const operationsBuilder = new OperationsBuilder(previousSelectionWorkspace);
    const transactionBuilder = processor.core.transactions.builder(previousSelectionWorkspace);
    const selectedPart = previousSelectionWorkspace.cloneFragment.selectedPart(AffectedNodesPart.WITHIN).nodes;

    handlingContext.transactionBuilder = transactionBuilder;

    if (!previousSelectionWorkspace.selection.commonAncestor.isTextNode)
        transactionBuilder.appendInjections(operationsBuilder.injectNodes([
            ...previousSelectionWorkspace.cloneFragment.selectedPart(AffectedNodesPart.BEFORE).nodes,
            ...previousSelectionWorkspace.cloneFragment.selectedPart(AffectedNodesPart.AFTER).nodes,
        ]));

    transactionBuilder.appendRemovals(operationsBuilder.removeSelected());

    processor.commandHandler.handleInsertion(selectedPart, handlingContext);
};

export default internalDrop;