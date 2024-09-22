import AffectedNodes from '../../../core/selection/interfaces/affected-nodes.interface.ts';
import Core from '../../../core/core.ts';
import SelectionStateType from '../../../core/selection/enums/selection-state-type.enum.ts';
import ClonedFragment from './fragments-cloner/helpers/cloned-fragment.ts';
import AffectedNodesPart from '../../../core/selection/enums/affected-nodes-part.enum.ts';

class FragmentsCloner {

    constructor(private readonly core: Core) {}

    public selectedPart(part: AffectedNodesPart): ClonedFragment {
        const currentSelection = this.core.selection.get(SelectionStateType.CURRENT);
        const affectedNodes = currentSelection.getAffectedNodes(part);
        const clonedFragment = new ClonedFragment();
        affectedNodes.map(node => this.cloneNodeWithChildren(node, clonedFragment, true));
        return clonedFragment;
    }

    private cloneNodeWithChildren(node: AffectedNodes, clonedFragment: ClonedFragment, isRoot: boolean): Node {
        const clonedNode = node.node.cloneNode();
        clonedFragment.add(node.node, clonedNode, isRoot);
        node.children.forEach(child => {
            clonedNode.appendChild(this.cloneNodeWithChildren(child, clonedFragment, false));
        });
        return clonedNode;
    }
}

export default FragmentsCloner;