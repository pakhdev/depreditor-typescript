import { EditorInitializer } from '../../editor-Initializer.ts';
import { HtmlElementBuilder } from '../../tools/html-element-builder.ts';
import { ToolbarButton } from './interfaces/toolbar-button.ts';
import { ToolbarButtonState } from './interfaces/button-button-state.interface.ts';
import { toolbarButtons } from './toolbar-buttons/toolbar-buttons.ts';

export class Toolbar {

    private readonly buttonElements: ToolbarButtonState[] = [];

    constructor(private readonly depreditor: EditorInitializer) {
        this.createButtons();
        this.buttonElements.forEach(button => this.depreditor.toolbarContainer.appendChild(button.element));
        this.depreditor.eventHooks.addHooks(['afterAny'], () => this.updateButtonsState());
    }

    // Crea los botones de la barra de herramientas
    private createButtons(): void {
        toolbarButtons.forEach(button => {
            const element = HtmlElementBuilder.createElement('button', {
                classes: ['editor-toolbar__icon', button.icon],
                onmousedown: () => this.handleButtonAction(button),
            });
            this.buttonElements.push({ element, toolName: button.name, activated: false });
        });
    }

    // Actualiza el estado de los botones de la barra de herramientas
    public updateButtonsState(): void {
        // TODO: Obtener los estilos de los nodos seleccionados - this.depreditor.selectedNodes
        // TODO: Actualizar el estado de los botones
    }

    // Maneja la acción de la herramienta
    public handleButtonAction(button: ToolbarButton): void {
        if (button.requiresModal) {
            // TODO: Abrir modal
            return;
        }
        // TODO: Comprobar si hay que extender la selección
        // TODO: Cortar aquí la parte seleccionada?
        // TODO: Dependiendo de la herramienta comprobar si hay que aplicar un formato o eliminarlo
        // TODO: Comprobar si hay que ignorar la acción
        // TODO: Llamar a la función de la herramienta
    }

}