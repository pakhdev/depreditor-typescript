import { DomSelection } from './helpers/dom-selection.ts';
import { EventHooks } from '../event-hooks/event-hooks.ts';
import { Topology } from '../topology/topology.ts';
import { StateSelection } from './helpers/state-selection.ts';
import { NodeSelection } from './helpers/node-selection.ts';
import { SelectionStateType } from './enums/selection-state-type.enum.ts';

export class Selection {

    constructor(
        private readonly editableDiv: HTMLDivElement,
        public readonly contentTopology: Topology,
        eventHooks: EventHooks,
    ) {
        this.subscribeToRelevantEvents(eventHooks);
    }

    public set(startNodeSelection: NodeSelection, endNodeSelection: NodeSelection): void {
        // TODO: Asignar la selección al DOM
        // TODO: Actualizar el estado de selección
    }

    public get(selectionType: SelectionStateType) {
        // TODO: Antes de devolver buscar los nodos
        // return this.selectionState[selectionType];
    }

    private subscribeToRelevantEvents(eventHooks: EventHooks): void {
        eventHooks.on(['userNavigation', 'internalDrop'], this.syncToContentState.bind(this));
    }

    private saveNewSelection(): void {}

    private syncToContentState(): void {
        const currentSelection = DomSelection.get(this.editableDiv);
        StateSelection.set(this.contentTopology, currentSelection);
    }

}
