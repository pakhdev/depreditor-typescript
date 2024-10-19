import HandlingContext from '../../../processor/command-handler/interfaces/handling-context.interface.ts';
import Processor from '../../../processor/processor.ts';

interface EditorEventInterceptor {
    (
        processor: Processor,
        element: Node,
        handlingContext: HandlingContext,
    ): boolean;
}

export default EditorEventInterceptor;