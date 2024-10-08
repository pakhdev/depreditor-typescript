import Core from '../../core/core.ts';
import Processor from '../../processor/processor.ts';
import ToolbarButton from './interfaces/toolbar-button.interface.ts';
import ToolbarButtonState from './interfaces/toolbar-button-state.interface.ts';
import toolbarButtonsConfig from './config/toolbar-buttons.config.ts';
import FormattingEntry from '../../processor/utilities/formatting-reader/interfaces/formatting-entry.interface.ts';
import FormattingCoverage from '../../processor/utilities/formatting-reader/enums/formatting-coverage.enum.ts';
import Modal from '../modal/modal.ts';

class Toolbar {

    private readonly buttonsConfig: { [key: string]: ToolbarButton } = toolbarButtonsConfig;
    private readonly buttonElements: Map<HTMLButtonElement, ToolbarButtonState> = new Map();

    constructor(
        private readonly core: Core,
        private readonly processor: Processor,
        private readonly modal: Modal,
        private readonly toolbarContainer: HTMLElement,
    ) {
        this.createButtons();
        this.subscribeToRelevantEvents();
    }

    public createButtons(): void {
        Object.values(this.buttonsConfig).forEach((buttonConfig: ToolbarButton) => {
            const buttonElement = this.processor.htmlBuilder.createElement('button', {
                classes: ['editor-toolbar__icon', buttonConfig.icon],
                onmousedown: (event) => this.handleButtonAction(event),
            }) as HTMLButtonElement;
            this.toolbarContainer.appendChild(buttonElement);
            this.buttonElements.set(buttonElement, {
                activated: false,
                modalSchema: buttonConfig.modalSchema,
                formattingContainerProperties: buttonConfig.formattingContainerProperties,
            });
        });
    }

    public handleButtonAction(event: Event): void {
        const buttonProperties = this.buttonElements.get(event.target as HTMLButtonElement);
        if (!buttonProperties) return;

        if (buttonProperties.modalSchema) {
            this.modal.openSchema(buttonProperties.modalSchema);
            return;
        }

        const { tagName, attributes, styles, classes } = buttonProperties.formattingContainerProperties;
        const wrapper = this.processor.htmlBuilder.createElement(tagName, { ...attributes, styles, classes });
        this.processor.commandHandler.handleElement(wrapper);
    }

    public handleButtonsState(): void {
        const currentFormatting: FormattingEntry[] = this.processor.formattingReader.getCurrentFormatting().entries;
        console.log(currentFormatting);
        this.buttonElements.forEach((state, button) => {
            if (currentFormatting.some(entry => entry.coverage === FormattingCoverage.FULL && entry.formatting === state.formattingContainerProperties)) {
                button.classList.add('editor-toolbar__icon--active');
                state.activated = true;
            } else if (state.activated) {
                button.classList.remove('editor-toolbar__icon--active');
                state.activated = false;
            }
        });
    }

    private subscribeToRelevantEvents(): void {
        this.core.eventHooks.on(['selectionChange'], () => this.handleButtonsState());
    }
}

export default Toolbar;