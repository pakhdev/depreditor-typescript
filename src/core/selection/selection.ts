import { Topology } from '../topology/topology.ts';
import { EventHooks } from '../event-hooks/event-hooks.ts';

export class Selection {

    // TODO: Add hooks class
    constructor(
        public readonly contentTopology: Topology,
        eventHooks: EventHooks,
    ) {
        this.subscribeToUserNavigation(eventHooks);
    }

    public setDOMSelection(): void {
        // TODO: Asignar la selección al DOM
        // TODO: Actualizar la topología
    }

    private getDOMSelection(): void {
        // TODO: Obtener nodo de inicio y fin de la selección
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
        // TODO: Obtener la selección en el DOM y asignarla al estado
    }

    // TODO: Recibir nodo de inicio y fin en los argumentos
    private findCommonAncestor(): Node {
        // TODO: Encontrar el ancestro común de dos nodos
    }

}
