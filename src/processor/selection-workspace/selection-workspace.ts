import Core from '../../core/core.ts';
import FormattingReader from '../utilities/formatting-reader/formatting-reader.ts';
import FormattingSummary from '../utilities/formatting-reader/entities/formatting-summary.ts';
import FragmentsCloner from './helpers/fragments-cloner.ts';
import IndentGetter from './helpers/indent-getter.ts';
import SelectionStateType from '../../core/selection/enums/selection-state-type.enum.ts';
import StoredSelection from '../../core/selection/helpers/stored-selection.ts';
import WorkspaceExtender from './helpers/workspace-extender/workspace-extender.ts';

class SelectionWorkspace {
    public readonly selection: StoredSelection;

    constructor(
        private readonly core: Core,
        private readonly selectionType: SelectionStateType = SelectionStateType.CURRENT,
    ) {
        const { commonAncestor, startElement, endElement } = this.core.selection.get(this.selectionType);
        this.selection = this.core.selection.create(commonAncestor, startElement, endElement);
    }

    public get cloneFragment(): FragmentsCloner {
        return new FragmentsCloner(this.selection);
    }

    public get extend(): WorkspaceExtender {
        return new WorkspaceExtender(this, this.selection);
    }

    public get indent(): number {
        return IndentGetter.get(this.selection);
    }

    public get formatting(): FormattingSummary {
        return new FormattingReader(this.core).getSelectionFormatting(this.selectionType);
    }

    public get isNothingSelected(): boolean {
        return this.selection.isNothingSelected;
    }

    public get isSomethingSelected(): boolean {
        return this.selection.isSomethingSelected;
    }

    public get hasInlineParent(): boolean {
        const { commonAncestor } = this.selection;
        if (!commonAncestor.path.length)
            return false;

        let node: Node | null = commonAncestor.node;
        const { ownerEditor } = commonAncestor;
        while (node && node !== ownerEditor) {
            const element = node as HTMLElement;
            const containerProperties = this.core.containers.identify(element);
            if (containerProperties && !containerProperties.isBlock)
                return true;

            node = node.parentNode;
        }

        return false;
    }

    public get commonAncestor(): Node {
        return this.selection.commonAncestor.node;
    }

}

export default SelectionWorkspace;