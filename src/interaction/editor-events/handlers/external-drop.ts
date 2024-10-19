import Processor from '../../../processor/processor.ts';
import TextPreprocessor from '../helpers/text-preprocessor.ts';
import EditorEventHandler from '../interfaces/editor-event-handler.interface.ts';
import HandlingContext from '../../../processor/command-handler/interfaces/handling-context.interface.ts';
import Interaction from '../../interaction.ts';

const externalDrop: EditorEventHandler = (event: Event, processor: Processor, _: Interaction, handlingContext: HandlingContext): void => {
    const e = event as DragEvent;
    e.preventDefault();
    const dataTransfer = e.dataTransfer;
    if (!dataTransfer) return;
    let text = new TextPreprocessor(dataTransfer.getData('text')).sanitize();

    processor.commandHandler.handleInsertion(
        text.containsBreakLine() ? text.getAsHtml() : text.getAsText(),
        handlingContext,
    );
};

export default externalDrop;