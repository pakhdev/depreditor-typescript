import DomSelection from './helpers/dom-selection.ts';
import EventHooks from '../event-hooks/event-hooks.ts';
import SelectionStateType from './enums/selection-state-type.enum.ts';
import StoredSelection from './helpers/stored-selection.ts';
import SelectedElement from './helpers/selected-element.ts';

class Selection {

    private readonly state: {
        previous: StoredSelection,
        current: StoredSelection,
    };

    constructor(
        private readonly editableDiv: HTMLDivElement,
        private readonly eventHooks: EventHooks,
    ) {
        this.subscribeToRelevantEvents(this.eventHooks);
        this.state = {
            previous: DomSelection.get(this.editableDiv),
            current: DomSelection.get(this.editableDiv),
        };
    }

    public create(commonAncestor: SelectedElement, startElement: SelectedElement, endElement: SelectedElement): StoredSelection {
        return new StoredSelection(this.editableDiv, startElement, endElement, commonAncestor);
    }

    public set(storedSelection: StoredSelection): void {
        const { startElement, endElement } = storedSelection;

        const range = document.createRange();
        range.setStart(startElement.node, startElement.offset.start);
        range.setEnd(endElement.node, endElement.offset.end);

        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
        }

        this.storeSelection();
    }

    public get(selectionType: SelectionStateType): StoredSelection {
        return this.state[selectionType];
    }

    private subscribeToRelevantEvents(eventHooks: EventHooks): void {
        eventHooks.on(['userNavigation', 'internalDrop'], this.storeSelection.bind(this));
    }

    private storeSelection(): void {
        const currentSelection = DomSelection.get(this.editableDiv);
        this.state.previous = this.state.current;
        this.state.current = currentSelection;
        this.eventHooks.executeHooks('selectionChange');
    }

}

export default Selection;