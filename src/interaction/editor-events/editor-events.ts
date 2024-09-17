import Core from '../../core/core.ts';
import HookHandlers from './interfaces/hook-handlers.interface.ts';
import Processor from '../../processor/processor.ts';
import write from './handlers/write.ts';
import backspace from './handlers/backspace.ts';
import cut from './handlers/cut.ts';
import remove from './handlers/remove.ts';

class EditorEvents {
    private readonly list: HookHandlers[] = [
        { hooks: ['writing'], method: write },
        { hooks: ['backspace'], method: backspace },
        { hooks: ['cut'], method: cut },
        { hooks: ['delete'], method: remove },
    ];

    constructor(
        private readonly core: Core,
        private readonly processor: Processor,
    ) {
        this.registerActions();
    }

    private registerActions(): void {
        this.list.forEach(action => {
            this.core.eventHooks.on(action.hooks, (event) => action.method(event, this.processor));
        });
    }
}

export default EditorEvents;