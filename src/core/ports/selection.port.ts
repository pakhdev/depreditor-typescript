import Selection from '../selection/selection.ts';
import SelectionStateType from '../selection/enums/selection-state-type.enum.ts';
import StoredSelection from '../selection/helpers/stored-selection.ts';
import SelectedElement from '../selection/helpers/selected-element.ts';

class SelectionPort {
    constructor(private readonly selection: Selection) {}

    public create(commonAncestor: SelectedElement, startElement: SelectedElement, endElement: SelectedElement): StoredSelection {
        return this.selection.create(commonAncestor, startElement, endElement);
    }

    public get(selectionType: SelectionStateType): StoredSelection {
        return this.selection.get(selectionType);
    }
}

export default SelectionPort;