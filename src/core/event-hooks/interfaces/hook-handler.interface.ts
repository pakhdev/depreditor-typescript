import Processor from '../../../processor/processor.ts';
import Interaction from '../../../interaction/interaction.ts';

interface HookHandler {
    (event?: Event, processor?: Processor, interaction?: Interaction): void;
}

export default HookHandler;