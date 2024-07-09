import { ActionHandler } from '../interfaces/action-handler.interface.ts';

export const writing: ActionHandler = (selectedNodes, event) => {
    if (!event || selectedNodes === null) return;
    const e = event as KeyboardEvent;
    console.log('Presionado', e.key);
};