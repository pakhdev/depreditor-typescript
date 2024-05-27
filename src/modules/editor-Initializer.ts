import { Actions } from './actions/actions.ts';
import { EventHooks } from './event-hooks/event-hooks.ts';
import { SelectionManager } from './selection-manager/selection-manager.ts';
import { Toolbar } from './ui/toolbar/toolbar.ts';
import { Topology } from './topology/topology.ts';
import { TopologyBuilder } from './topology/helpers/topology-builder.ts';

export class EditorInitializer {

    public readonly eventHooks: EventHooks;
    public selectedNodes: Topology;
    private domChangeObserver!: MutationObserver;
    // TODO: Crear un módulo History
    // public readonly history: History;

    constructor(
        public readonly editableDiv: HTMLDivElement,
        public readonly toolbarContainer: HTMLElement,
    ) {
        this.eventHooks = new EventHooks(this, this.editableDiv);
        this.eventHooks.addHooks(['afterAny'], () => this.selectedNodes = this.getSelectedNodes());
        new Toolbar(this);
        new Actions(this);
        this
            .normalizeCode()
            .startObservingDOM();
        this.selectedNodes = this.getSelectedNodes();
    }

    private normalizeCode(): EditorInitializer {
        this.editableDiv.innerHTML = this.editableDiv.innerHTML
            .replace(/\n/g, '')
            .replace(/\s+/g, ' ')
            .replace(/>\s/g, '>')
            .replace(/\s</g, '<');
        return this;
    }

    private startObservingDOM(): EditorInitializer {
        this.domChangeObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.removedNodes) {
                    if (Array.from(mutation.removedNodes).includes(this.editableDiv)) {
                        this.destroyListeners();
                    }
                }
            }
        });

        if (this.editableDiv.parentNode)
            this.domChangeObserver.observe(this.editableDiv.parentNode, { childList: true });
        return this;
    }

    private getSelectedNodes(): Topology {
        const selection = new SelectionManager(this.editableDiv).getSelection();
        return TopologyBuilder.fromSelection(selection);
    }

    private stopObservingDOM(): void {
        if (!this.domChangeObserver) return;
        this.domChangeObserver.disconnect();
    }

    private destroyListeners(): void {
        if (!this.editableDiv) return;
        this.eventHooks.unsubscribeAll();
        this.stopObservingDOM();
    }

}