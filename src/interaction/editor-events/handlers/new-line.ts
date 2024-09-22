import HookHandler from '../../../core/event-hooks/interfaces/hook-handler.interface.ts';
import Processor from '../../../processor/processor.ts';

const newLine: HookHandler = (event?: Event, processor?: Processor): void => {
    if (!event || !processor)
        throw new Error('NewLine: El evento o el procesador no están definidos');
    const e = event as KeyboardEvent;
    e.preventDefault();
    processor.commandHandler.insertNodes([document.createElement('br')]);
};

export default newLine;