import Processor from '../../../processor/processor.ts';

interface HookHandler {
    (event?: Event, processor?: Processor): void;
}

export default HookHandler;