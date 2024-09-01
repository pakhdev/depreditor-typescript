import HookHandler from '../../../core/event-hooks/interfaces/hook-handler.interface.ts';

interface HookHandlers {
    hooks: string[];
    method: HookHandler;
}

export default HookHandlers;