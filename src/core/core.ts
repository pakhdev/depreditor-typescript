import EventHooks from './event-hooks/event-hooks.ts';
import Selection from './selection/selection.ts';
import TransactionsManager from './transactions-manager/transactions-manager.ts';
import ContainersPort from './ports/containers.port.ts';
import EventHooksPort from './ports/event-hooks.port.ts';
import SelectionPort from './ports/selection.port.ts';
import TransactionsPort from './ports/transactions.port.ts';

class Core {

    public containers: ContainersPort;
    public eventHooks: EventHooksPort;
    public selection: SelectionPort;
    public transactions: TransactionsPort;

    constructor(editableDiv: HTMLDivElement) {
        const eventHooks = new EventHooks(editableDiv);
        const selection = new Selection(editableDiv, eventHooks);
        const transactionsManager = new TransactionsManager(selection);
        this.transactions = new TransactionsPort(transactionsManager);
        this.eventHooks = new EventHooksPort(eventHooks);
        this.selection = new SelectionPort(selection);
        this.containers = new ContainersPort();
    }
}

export default Core;
