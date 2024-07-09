import { ActionHandler } from './action-handler.interface.ts';

export interface HookActions {
    hooks: string[];
    method: ActionHandler;
}