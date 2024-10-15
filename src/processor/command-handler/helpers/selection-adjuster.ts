import ActionTypes from '../enums/action-types.enum.ts';
import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';
import SelectionWorkspace from '../../selection-workspace/selection-workspace.ts';

class SelectionAdjuster {
    public static adjust(workspace: SelectionWorkspace, containerProperties: ContainerProperties, action: ActionTypes): void {
        switch (action) {
            case ActionTypes.WRAP:
                this.adjustWrap(workspace, containerProperties);
                break;
            case ActionTypes.UNWRAP:
                this.adjustUnwrap(workspace, containerProperties);
                break;
            case ActionTypes.INSERT:
                this.adjustInsert(workspace, containerProperties);
                break;
        }
    }

    private static adjustWrap(workspace: SelectionWorkspace, containerProperties: ContainerProperties): void {
        if (containerProperties.isBlock)
            workspace.extend.outsideInlineParents();

        const { formatting, isNothingSelected } = workspace;
        const similarFormatting = formatting.getSimilar(containerProperties);
        if (similarFormatting)
            similarFormatting.forEach(entry =>
                entry.nodes.forEach(node => workspace.extend.coverNode(node)),
            );
        if (isNothingSelected)
            workspace.extend.selectFully();
    }

    private static adjustUnwrap(workspace: SelectionWorkspace, containerProperties: ContainerProperties): void {
        const { formatting } = workspace;
        const formattingEntry = formatting.entries.find(entry => entry.formatting === containerProperties);
        if (formattingEntry)
            formattingEntry.nodes.forEach(node => workspace.extend.coverNode(node));
    }

    private static adjustInsert(workspace: SelectionWorkspace, containerProperties: ContainerProperties): void {
        if (containerProperties.isBlock)
            workspace.extend.outsideInlineParents();
    }
}

export default SelectionAdjuster;