import StoredSelection from '../../core/selection/helpers/stored-selection.ts';
import Core from '../../core/core.ts';
import SelectionStateType from '../../core/selection/enums/selection-state-type.enum.ts';

class SelectionWorkspace {
    private selection: StoredSelection;

    constructor(private readonly core: Core) {
        const { commonAncestor, startElement, endElement } = this.core.selection.get(SelectionStateType.CURRENT);
        this.selection = this.core.selection.create(commonAncestor, startElement, endElement);
    }
}