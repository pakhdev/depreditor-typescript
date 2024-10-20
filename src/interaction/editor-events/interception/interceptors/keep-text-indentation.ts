import Processor from '../../../../processor/processor.ts';
import HandlingContext from '../../../../processor/command-handler/interfaces/handling-context.interface.ts';

const keepTextIndentation = (processor: Processor, _: Node, handlingContext: HandlingContext): boolean => {
    const { selectionWorkspace: currentWorkspace } = processor.selectionWorkspace;
    handlingContext.indentation = currentWorkspace.indent;
    return false;
};

export default keepTextIndentation;