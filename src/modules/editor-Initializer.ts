import { Actions } from './actions/actions.ts';
import { SelectionManager } from './selection-manager/selection-manager.ts';
import { Toolbar } from './ui/toolbar/toolbar.ts';
import { Topology } from './topology/topology.ts';
import { TopologyBuilder } from './topology/helpers/topology-builder.ts';
import { ContentState } from '../core/content-state/content-state.ts';
import { Selection } from '../core/selection/selection.ts';
import { EventHooks } from '../core/event-hooks/event-hooks.ts';

export class EditorInitializer {

    // public readonly eventHooks: EventHooks;
    public selectedNodes: Topology;
    private domChangeObserver!: MutationObserver;
    // TODO: Crear un módulo History
    // public readonly history: History;

    // Parte nueva
    private readonly selection: Selection;
    private readonly eventHooks: EventHooks;

    // Fin parte nueva

    constructor(
        public readonly editableDiv: HTMLDivElement,
        public readonly toolbarContainer: HTMLElement,
    ) {
        // this.eventHooks = new EventHooks(this, this.editableDiv);
        // this.eventHooks.addHooks(['afterAny'], () => this.selectedNodes = this.getSelectedNodes());
        // new Toolbar(this);
        // new Actions(this);

        // Parte nueva
        this
            .normalizeCode()
            .startObservingDOM(); // DEL
        this.eventHooks = new EventHooks(this.editableDiv);
        this.selection = new Selection(
            this.editableDiv,
            this.eventHooks,
        );

        // Fin parte nueva

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