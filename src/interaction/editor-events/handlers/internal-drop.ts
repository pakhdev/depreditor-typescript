import Processor from '../../../processor/processor.ts';
import HookHandler from '../../../core/event-hooks/interfaces/hook-handler.interface.ts';
import TextPreprocessor from '../helpers/text-preprocessor.ts';

const internalDrop: HookHandler = (event?: Event, processor?: Processor): void => {
    if (!event || !processor)
        throw new Error('Internal: El evento o el procesador no están definidos');
    const e = event as DragEvent;
    e.preventDefault();
    e.dataTransfer!.getData('text');
    const dataTransfer = e.dataTransfer;
    if (!dataTransfer) return;
    let text = new TextPreprocessor(dataTransfer.getData('text')).sanitize();
    if (text.containsBreakLine())
        processor.commandHandler.insertNodes(text.getAsHtml());
    else
        processor.commandHandler.handleText(text.getAsText());
};

export default internalDrop;