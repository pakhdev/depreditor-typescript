import Selection from '../selection/selection.ts';
import SelectionStateType from '../selection/enums/selection-state-type.enum.ts';
import StoredSelection from '../selection/helpers/stored-selection.ts';

class SelectionPort {
    constructor(private readonly selection: Selection) {}

    public get(selectionType: SelectionStateType): StoredSelection {
        return this.selection.get(selectionType);
    }
}

export default SelectionPort;