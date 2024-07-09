import { EditorInitializer } from '../editor-Initializer.ts';
import { writing } from './handlers/writing.ts';
import { HookActions } from './interfaces/hook-actions.interface.ts';

export class Actions {

    private readonly list: HookActions[] = [
        { hooks: ['onWriting'], method: writing },
        
        // TODO: deleting / cutting,
        // TODO: pasting
        // TODO: dropping
        // TODO: new line
        // TODO: undo
        // TODO: redo
    ];

    constructor(private readonly depreditor: EditorInitializer) {
        this.registerActions();
    }

    private registerActions(): void {
        this.list.forEach(action => {
            this.depreditor.eventHooks.addHooks(action.hooks, action.method);
        });
    }
}