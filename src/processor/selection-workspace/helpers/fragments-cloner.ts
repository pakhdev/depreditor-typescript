import AffectedNodes from '../../../core/selection/interfaces/affected-nodes.interface.ts';
import Core from '../../../core/core.ts';
import SelectionStateType from '../../../core/selection/enums/selection-state-type.enum.ts';

class FragmentsCloner {

    constructor(private readonly core: Core) {}

    public selectedPart(part: AffectedNodesPart): Node[] {
        const currentSelection = this.core.selection.get(SelectionStateType.CURRENT);
        const affectedNodes = currentSelection.getAffectedNodes(part);
        return affectedNodes.map(node => this.cloneNodeWithChildren(node));
    }

    private cloneNodeWithChildren(node: AffectedNodes): Node {
        const clonedNode = node.node.cloneNode();
        node.children.forEach(child => {
            clonedNode.appendChild(this.cloneNodeWithChildren(child));
        });
        return clonedNode;
    }
}

export default FragmentsCloner;