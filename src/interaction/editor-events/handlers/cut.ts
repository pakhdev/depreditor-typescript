import Processor from '../../../processor/processor.ts';
import HookHandler from '../../../core/event-hooks/interfaces/hook-handler.interface.ts';

const cut: HookHandler = (event?: Event, processor?: Processor): void => {
    if (!event || !processor)
        throw new Error('Cut: El evento o el procesador no están definidos');
    const e = event as KeyboardEvent;
    e.preventDefault();
    if (processor.selectionWorkspace.isNothingSelected)
        return;
    processor.commandHandler.handleText(null);
};

export default cut;