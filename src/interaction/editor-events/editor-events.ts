import Core from '../../core/core.ts';
import Processor from '../../processor/processor.ts';
import Interaction from '../interaction.ts';
import HookHandlers from './interfaces/hook-handlers.interface.ts';
import write from './handlers/write.ts';
import backspace from './handlers/backspace.ts';
import cut from './handlers/cut.ts';
import remove from './handlers/remove.ts';
import paste from './handlers/paste.ts';
import externalDrop from './handlers/external-drop.ts';
import internalDrop from './handlers/internal-drop.ts';

class EditorEvents {
    private readonly list: HookHandlers[] = [
        { hooks: ['writing'], method: write },
        { hooks: ['backspace'], method: backspace },
        { hooks: ['cut'], method: cut },
        { hooks: ['delete'], method: remove },
        { hooks: ['paste'], method: paste },
        { hooks: ['externalDrop'], method: externalDrop },
        { hooks: ['internalDrop'], method: internalDrop },
    ];

    constructor(
        private readonly core: Core,
        private readonly processor: Processor,
        private readonly interaction: Interaction,
    ) {
        this.registerActions();
    }

    private registerActions(): void {
        this.list.forEach(action => {
            this.core.eventHooks.on(action.hooks, (event) => action.method(event, this.processor, this.interaction));
        });
    }
}

export default EditorEvents;