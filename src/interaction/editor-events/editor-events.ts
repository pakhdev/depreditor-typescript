import Core from '../../core/core.ts';
import HookHandlers from './interfaces/hook-handlers.interface.ts';
import { writing } from './handlers/writing.ts';

class EditorEvents {
    private readonly list: HookHandlers[] = [
        { hooks: ['writing'], method: writing },
    ];

    constructor(private readonly core: Core) {
        this.registerActions();
    }

    private registerActions(): void {
        this.list.forEach(action => {
            this.core.eventHooks.on(action.hooks, action.method);
        });
    }
}

export default EditorEvents;