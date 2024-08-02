import ActionTypes from './enums/action-types.enum.ts';
import ContainerBuilder from './helpers/container-builder/container-builder.ts';
import ContainerType from '../../core/containers/enums/container-type.enum.ts';
import Core from '../../core/core.ts';
import ElementCreationProperties from './interfaces/element-creation-properties.interface.ts';
import FormattingCoverage from '../utilities/formatting-reader/enums/formatting-coverage.enum.ts';
import FormattingSummary from '../utilities/formatting-reader/helpers/formatting-summary.ts';
import SelectionWorkspace from '../selection-workspace/selection-workspace.ts';

class CommandHandler {
    constructor(private readonly core: Core) {}

    public execute(elementProperties: ElementCreationProperties): void {
        ContainerBuilder.create(elementProperties).then((element) => {
            if (!element)
                return;
            const workspace = new SelectionWorkspace(this.core);
            const { isNothingSelected } = workspace;
            const currentFormatting = workspace.formatting;
            const action = this.resolveContainerAction(element, currentFormatting, isNothingSelected);

            // Adjust workspace selection
            // Run insert/wrap/unwrap command
            // Create transaction
            // Commit transaction
        });
    }

    private resolveContainerAction(element: HTMLElement, formatting: FormattingSummary, isNothingSelected: boolean): ActionTypes {
        const containerProperties = this.core.containers.identify(element);
        if (!containerProperties)
            throw new Error('El elemento no está definido');

        const { types } = containerProperties;
        if (types.includes(ContainerType.WRAPPER)) {
            const isAlreadyFormatted = formatting.entries.some(
                entry => entry.formatting === containerProperties && entry.coverage === FormattingCoverage.FULL,
            );
            if (isAlreadyFormatted)
                return ActionTypes.UNWRAP;

            if (!isNothingSelected)
                return ActionTypes.WRAP;
        }

        if (types.includes(ContainerType.INSERTABLE))
            return ActionTypes.INSERT;

        return ActionTypes.NONE;
    }
}

export default CommandHandler;