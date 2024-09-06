import Processor from '../../processor/processor.ts';
import modalSchemas from './config/modal-schemas.ts';
import ModalSchema from './interfaces/modal-schema.interface.ts';
import HtmlBuilderPort from '../../processor/ports/html-builder.port.ts';
import StructureSchema from '../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';

class Modal {

    private htmlBuilder: HtmlBuilderPort;
    private popupContainer: HTMLElement | undefined;
    private popupElement: HTMLElement | undefined;
    private openedPopupType: string | undefined;
    private readonly schemas: ModalSchema[];

    constructor(
        private readonly processor: Processor,
        private readonly editableDiv: HTMLElement,
    ) {
        this.htmlBuilder = this.processor.htmlBuilder;
        this.schemas = modalSchemas(processor);
    }

    public openPopup(schemaName: string): void {
        const schema = this.schemas.find(s => s.name === schemaName);
        if (!schema)
            throw new Error(`No se encontró el esquema de modal con nombre ${ schemaName }`);

        this.openedPopupType = schemaName;
        this.buildPopup()
            .addHeader(schema.headerText)
            .addContent(schema.content)
            .addFooter(schema.actionButtonText);
    }

    public closePopup(): void {
        if (!this.popupContainer) return;
        this.popupContainer.remove();
        this.popupContainer = undefined;
        this.openedPopupType = undefined;
    }

    private buildPopup() {
        this.popupContainer = this.processor.htmlBuilder.createElement('div', {
            classes: ['depreditor-popup-container'],
            onmousedown: () => this.closePopup(),
        });
        this.popupElement = this.processor.htmlBuilder.createElement('div', {
            classes: ['depreditor-popup'],
            onmousedown: (event) => event.stopPropagation(),
        });
        this.popupContainer!.appendChild(this.popupElement);
        this.editableDiv.appendChild(this.popupContainer);
        return this;
    }

    private addHeader(headerText: string) {
        this.checkContainerExists();
        this.popupElement!.appendChild(this.htmlBuilder.createElement('div', {
            classes: ['depreditor-popup__title'],
            textContent: headerText,
        }));
        return this;
    }

    private addContent(schema: StructureSchema) {
        this.checkContainerExists();
        this.popupElement!.appendChild(this.htmlBuilder.createStructure(schema));
        return this;
    }

    private addFooter(actionButtonText: string | undefined) {
        const footerStructure: StructureSchema = {
            tagName: 'div',
            attributes: { class: 'depreditor-popup__buttons-container' },
            children: [{
                tagName: 'button',
                attributes: {
                    classes: ['button-danger', 'button'],
                    textContent: 'Cancelar',
                    onmousedown: () => (e: Event) => {
                        e.stopPropagation();
                        this.closePopup();
                    },
                },
            }],
        };

        if (actionButtonText) {
            footerStructure.children!.push({
                tagName: 'button',
                attributes: {
                    classes: ['button-success', 'button'],
                    textContent: actionButtonText,
                    onmousedown: () => (e: Event) => {
                        e.stopPropagation();
                        // FUNC
                    },
                },
            });
        }
        this.popupElement!.appendChild(this.htmlBuilder.createStructure(footerStructure));
    }

    private checkContainerExists() {
        if (!this.popupElement)
            throw new Error('El contenedor del popup no ha sido inicializado');
    }
}

export default Modal;