import ActionTypes from '../enums/action-types.enum.ts';
import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';
import ContainerType from '../../../core/containers/enums/container-type.enum.ts';
import FormattingCoverage from '../../utilities/formatting-reader/enums/formatting-coverage.enum.ts';
import SelectionWorkspace from '../../selection-workspace/selection-workspace.ts';

class ActionResolver {
    public static resolveContainerAction(workspace: SelectionWorkspace, containerProperties: ContainerProperties): ActionTypes {
        const { commonAncestor, isNothingSelected } = workspace;
        const { types } = containerProperties;

        if (!isNothingSelected) {
            if (types.includes(ContainerType.WRAPPER)) {
                const isAlreadyFormatted = workspace.formatting.entries.some(
                    entry => entry.formatting === containerProperties && entry.coverage === FormattingCoverage.FULL,
                );
                if (isAlreadyFormatted)
                    return ActionTypes.UNWRAP;

                if (!isNothingSelected || (isNothingSelected && commonAncestor.nodeType === Node.TEXT_NODE))
                    return ActionTypes.WRAP;
            }
        }

        if (types.includes(ContainerType.INSERTABLE))
            return ActionTypes.INSERT;

        return ActionTypes.NONE;
    }
}

export default ActionResolver;