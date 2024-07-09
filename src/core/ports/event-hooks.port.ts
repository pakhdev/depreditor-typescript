import EventHooks from '../event-hooks/event-hooks.ts';
import HookHandler from '../event-hooks/interfaces/hook-handler.interface.ts';

class EventHooksPort {
    constructor(private readonly eventHooks: EventHooks) {}

    public on(eventNames: string[], method: HookHandler): void {
        this.eventHooks.on(eventNames, method);
    }
}

export default EventHooksPort;