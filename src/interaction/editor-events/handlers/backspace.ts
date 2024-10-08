import Processor from '../../../processor/processor.ts';
import HookHandler from '../../../core/event-hooks/interfaces/hook-handler.interface.ts';

const backspace: HookHandler = (event?: Event, processor?: Processor): void => {
    if (!event || !processor)
        throw new Error('Backspace: El evento o el procesador no están definidos');
    const e = event as KeyboardEvent;
    e.preventDefault();
    const workspace = processor.selectionWorkspace;
    const selectPrevious = workspace.selectPrevious();
    if (!selectPrevious)
        return;
    processor.commandHandler.deleteSelectedContent();
};

export default backspace;