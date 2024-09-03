import Core from '../../core/core.ts';
import Processor from '../../processor/processor.ts';
import ToolbarButton from './interfaces/toolbar-button.interface.ts';
import ToolbarButtonState from './interfaces/toolbar-button-state.interface.ts';
import toolbarButtonsConfig from './config/toolbar-buttons.config.ts';

class Toolbar {

    private readonly buttonsConfig: { [key: string]: ToolbarButton } = toolbarButtonsConfig;
    private readonly buttonElements: Map<HTMLButtonElement, ToolbarButtonState> = new Map();

    constructor(
        private readonly core: Core,
        private readonly processor: Processor,
        private readonly toolbarContainer: HTMLElement,
    ) {
        this.createButtons();
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
                formattingContainerProperties: buttonConfig.formattingContainerProperties,
            });
        });
    }

    public handleButtonAction(event: Event): void {
        console.log('Button clicked:', this.buttonElements.get(event.target as HTMLButtonElement));
    }
}

export default Toolbar;