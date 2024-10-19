import Processor from '../../../processor/processor.ts';
import EditorEventHandler from '../interfaces/editor-event-handler.interface.ts';

const backspace: EditorEventHandler = (event: Event, processor: Processor): void => {
    if (!event || !processor)
        throw new Error('Backspace: El evento o el procesador no están definidos');
    const e = event as KeyboardEvent;
    e.preventDefault();
    const workspace = processor.selectionWorkspace;
    const selectPrevious = workspace.selectPrevious();
    if (!selectPrevious)
        return;
    processor.commandHandler.handleDeletion();
};

export default backspace;