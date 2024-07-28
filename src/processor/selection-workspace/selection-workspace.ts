import Core from '../../core/core.ts';
import FragmentsCloner from './helpers/fragments-cloner.ts';
import FragmentsFinder from './helpers/fragments-finder/fragments-finder.ts';
import SelectionStateType from '../../core/selection/enums/selection-state-type.enum.ts';
import StoredSelection from '../../core/selection/helpers/stored-selection.ts';
import WorkspaceExtender from './helpers/workspace-extender/workspace-extender.ts';

class SelectionWorkspace {
    private readonly selection: StoredSelection;

    constructor(private readonly core: Core) {
        const { commonAncestor, startElement, endElement } = this.core.selection.get(SelectionStateType.CURRENT);
        this.selection = this.core.selection.create(commonAncestor, startElement, endElement);
    }

    public get findFragment(): FragmentsFinder {
        return new FragmentsFinder(this.core);
    }

    public get cloneFragment(): FragmentsCloner {
        return new FragmentsCloner(this.core);
    }

    public get extend(): WorkspaceExtender {
        return new WorkspaceExtender(this.selection);
    }
}