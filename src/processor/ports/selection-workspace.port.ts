import Core from '../../core/core.ts';
import SelectionWorkspace from '../selection-workspace/selection-workspace.ts';

class SelectionWorkspacePort {

    public readonly selectionWorkspace: SelectionWorkspace;

    constructor(core: Core) {
        this.selectionWorkspace = new SelectionWorkspace(core);
    }

    public selectNext(): 'char' | 'element' | 'range' | null {
        return this.selectionWorkspace.extend.selectNext();
    }

    public selectPrevious(): 'char' | 'element' | 'range' | null {
        return this.selectionWorkspace.extend.selectPrevious();
    }

    get isNothingSelected(): boolean {
        return this.selectionWorkspace.isNothingSelected;
    }
}

export default SelectionWorkspacePort;