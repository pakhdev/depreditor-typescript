import Processor from '../../../processor/processor.ts';
import EditorEventHandler from '../interfaces/editor-event-handler.interface.ts';

const remove: EditorEventHandler = (event: Event, processor: Processor): void => {
    if (!event || !processor)
        throw new Error('Remove: El evento o el procesador no están definidos');
    const e = event as KeyboardEvent;
    e.preventDefault();
    const workspace = processor.selectionWorkspace;
    const selectNext = workspace.selectNext();
    if (!selectNext)
        return;
    processor.commandHandler.handleDeletion();
};

export default remove;