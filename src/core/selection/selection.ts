import { DomSelection } from './helpers/dom-selection.ts';
import { EventHooks } from '../event-hooks/event-hooks.ts';
import { SelectionStateType } from './enums/selection-state-type.enum.ts';
import { StoredSelection } from './helpers/stored-selection.ts';

export class Selection {

    private readonly state: {
        previous: StoredSelection,
        current: StoredSelection,
    };

    constructor(
        private readonly editableDiv: HTMLDivElement,
        eventHooks: EventHooks,
    ) {
        this.subscribeToRelevantEvents(eventHooks);
        this.state = {
            previous: DomSelection.get(this.editableDiv),
            current: DomSelection.get(this.editableDiv),
        };
    }

    public set(): void {
        // TODO: Asignar la selección al DOM
        this.storeSelection();
    }

    public get(selectionType: SelectionStateType) {
        return this.state[selectionType];
    }

    private subscribeToRelevantEvents(eventHooks: EventHooks): void {
        eventHooks.on(['userNavigation', 'internalDrop'], this.storeSelection.bind(this));
    }

    private storeSelection(): void {
        const currentSelection = DomSelection.get(this.editableDiv);
        this.state.previous = this.state.current;
        this.state.current = currentSelection;
    }

}
