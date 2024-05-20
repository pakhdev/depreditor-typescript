import { ContainerProps } from '../../types/container-props.type.ts';
import { toolsConfig } from '../../tools.config.ts';
import { ButtonElement } from './interfaces/button-element.interface.ts';
import { EditorInitializer } from '../editor-Initializer.ts';

export class Toolbar {

    private readonly toolsConfig: ContainerProps[] = toolsConfig;
    private readonly buttonElements: ButtonElement[] = [];

    constructor(private readonly depreditor: EditorInitializer) {
        this.createButtons();
        this.buttonElements.forEach(button => this.depreditor.toolbarContainer.appendChild(button.element));
        this.depreditor.eventHooks.addHooks(['afterAny'], () => this.updateButtonsState());
    }

    // Crea los botones de la barra de herramientas
    private createButtons(): void {
        // TODO: Crear los botones de la barra de herramientas asignando el método handleToolAction a su evento
        //  click con el parámetro correspondiente
    }

    // Actualiza el estado de los botones de la barra de herramientas
    public updateButtonsState(): void {
        // TODO: Obtener los estilos de los nodos seleccionados - this.depreditor.selectedNodes
        // TODO: Actualizar el estado de los botones
    }

    // Maneja la acción de la herramienta
    public handleToolAction(tool: ContainerProps): void {
        // TODO: Comprobar si hay que extender la selección
        // TODO: Cortar aquí la parte seleccionada?
        // TODO: Dependiendo de la herramienta comprobar si hay que aplicar un formato o eliminarlo
        // TODO: Comprobar si hay que ignorar la acción
        // TODO: Comprobar si hay que abrir un popup para algunos ajustes de la herramienta
    }

}