import Processor from '../../../processor/processor.ts';
import Interaction from '../../interaction.ts';
import HandlingContext from '../../../processor/command-handler/interfaces/handling-context.interface.ts';

interface EditorEventHandler {
    (event: Event, processor: Processor, interaction: Interaction, handlingContext: HandlingContext): void;
}

export default EditorEventHandler;