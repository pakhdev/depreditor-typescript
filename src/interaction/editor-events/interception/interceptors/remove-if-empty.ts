import EditorEventInterceptor from '../../interfaces/editor-event-interceptor.interface.ts';
import Processor from '../../../../processor/processor.ts';

const removeIfEmpty: EditorEventInterceptor = (processor: Processor, element: Node): boolean => {
    const { selectionWorkspace: currentWorkspace } = processor.selectionWorkspace;
    if (currentWorkspace.isNothingSelected) {
        currentWorkspace.extend.selectNode(element);
        processor.commandHandler.handleDeletion();
        return true;
    }
    return false;
};

export default removeIfEmpty;