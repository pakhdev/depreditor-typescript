import Processor from '../../../processor/processor.ts';
import EditorEventHandler from '../interfaces/editor-event-handler.interface.ts';
import Interaction from '../../interaction.ts';
import HandlingContext from '../../../processor/command-handler/interfaces/handling-context.interface.ts';

const newLine: EditorEventHandler = (event: Event, processor: Processor, _: Interaction, handlingContext: HandlingContext): void => {
    if (!event || !processor)
        throw new Error('NewLine: El evento o el procesador no están definidos');
    const e = event as KeyboardEvent;
    e.preventDefault();
    processor.commandHandler.insertNodes([document.createElement('br')], handlingContext);
};

export default newLine;