import { DomSelection } from './helpers/dom-selection.ts';
import { EventHooks } from '../event-hooks/event-hooks.ts';
import { Topology } from '../topology/topology.ts';
import { StateSelection } from './helpers/state-selection.ts';

export class Selection {

    constructor(
        private readonly editableDiv: HTMLDivElement,
        public readonly contentTopology: Topology,
        eventHooks: EventHooks,
    ) {
        this.subscribeToUserNavigation(eventHooks);
    }

    public setDOMSelection(): void {
        // TODO: Asignar la selección al DOM
        // TODO: Actualizar la topología
    }

    // TODO: Recibir nodo de inicio y fin en los argumentos
    private setStateSelection(): Selection {
        this.resetStateSelection();
        // TODO: Asignar la selección al estado
    }

    private resetStateSelection(topology: Topology): Selection {
        // TODO: Resetear la selección del estado de la topología y sus topologías hijas
    }

    private subscribeToUserNavigation(eventHooks: EventHooks): void {
        eventHooks.on(['userNavigation'], this.syncToContentState.bind(this));
    }

    private syncToContentState(): void {
        const currentSelection = DomSelection.get(this.editableDiv);
        StateSelection.set(this.contentTopology, currentSelection);
    }

    // TODO: Recibir nodo de inicio y fin en los argumentos
    private findCommonAncestor(): Node {
        // TODO: Encontrar el ancestro común de dos nodos
    }

}
