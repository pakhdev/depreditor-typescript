import HookHandler from '../../../core/event-hooks/interfaces/hook-handler.interface.ts';

export const writing: HookHandler = (_, event) => {
    if (!event) return;
    const e = event as KeyboardEvent;
    console.log('Presionado', e.key);
};