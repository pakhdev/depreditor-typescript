import Processor from '../../../processor/processor.ts';
import EditorEventHandler from '../interfaces/editor-event-handler.interface.ts';

const write: EditorEventHandler = (event: Event, processor: Processor): void => {
    if (!event || !processor)
        throw new Error('Write: El evento o el procesador no están definidos');
    const e = event as KeyboardEvent;
    e.preventDefault();
    processor.commandHandler.handleInsertion(e.key);
};

export default write;