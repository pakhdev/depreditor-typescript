import Core from '../../core/core.ts';
import SelectionWorkspace from '../selection-workspace/selection-workspace.ts';

class SelectionWorkspacePort {

    private readonly selectionWorkspace: SelectionWorkspace;

    constructor(core: Core) {
        this.selectionWorkspace = new SelectionWorkspace(core);
    }

    public selectNext(): boolean {
        return this.selectionWorkspace.extend.selectNext();
    }

    public selectPrevious(): boolean {
        return this.selectionWorkspace.extend.selectPrevious();
    }
}

export default SelectionWorkspacePort;