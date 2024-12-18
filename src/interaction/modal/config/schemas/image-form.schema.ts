import Modal from '../../modal.ts';
import ModalSchema from '../../interfaces/modal-schema.interface.ts';
import Processor from '../../../../processor/processor.ts';
import StructureSchema
    from '../../../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';
import ModalSchemaProvider from '../../interfaces/modal-schema-provider.interface.ts';

class ImageFormModal implements ModalSchemaProvider {

    constructor(private processor: Processor, private modal: Modal) {}

    public getSchema(): ModalSchema {
        return {
            headerText: 'Insertar imágenes',
            formattingContainerProperties: containersConfig.image,
            content: this.createContent(),
            actionButton: this.createActionButton(),
        };
    }

    private createContent(): StructureSchema {
        return {
            tagName: 'div',
            attributes: {
                class: 'depreditor-popup__centering-container',
            },
            children: [
                this.createToggleCheckboxStructure(),
                this.createFileInputStructure(),
            ],
        };
    }

    private createToggleCheckboxStructure(): StructureSchema {
        return {
            tagName: 'label',
            attributes: {
                class: 'toggle',
            },
            children: [
                {
                    tagName: 'input',
                    attributes: {
                        type: 'checkbox',
                        class: 'toggle-checkbox',
                    },
                },
                {
                    tagName: 'div',
                    attributes: {
                        class: 'toggle-switch',
                    },
                },
                {
                    tagName: 'span',
                    attributes: {
                        class: 'toggle-label',
                        textContent: 'Habilitar vista ampliada',
                    },
                },
            ],
        };
    }

    private createFileInputStructure(): StructureSchema {
        return {
            tagName: 'input',
            attributes: {
                multiple: 'true',
                type: 'file',
                accept: 'image/*',
                style: 'display: none',
                onchange: () => {
                    this.insertImages();
                    this.modal.closeModal();
                },
            },
        };
    }

    private createActionButton(): { text: string; action: (modal: Modal) => void } {
        return {
            text: 'Seleccionar imágenes',
            action: () => {
                const fileInput = this.getFileInput();
                fileInput.click();
            },
        };
    }

    private async insertImages(): Promise<void> {
        const fileInput = this.getFileInput();
        const checkboxInput = this.getCheckboxInput();
        const imageFiles: HTMLImageElement[] = await this.processor.imageLoader.load(Array.from(fileInput.files || []));
        const adjustedImages = this.processor.imageBuilder.create(imageFiles, checkboxInput.checked);
        this.processor.commandHandler.insertNodes(adjustedImages);
    }

    private getFileInput(): HTMLInputElement {
        if (!this.modal.modalContainer) {
            throw new Error('No se encontró el contenedor del modal');
        }
        const fileInput = this.modal.modalContainer.querySelector('input[type="file"]') as HTMLInputElement;
        if (!fileInput) {
            throw new Error('No se encontró el input de imagen');
        }
        return fileInput;
    }

    private getCheckboxInput(): HTMLInputElement {
        if (!this.modal.modalContainer) {
            throw new Error('No se encontró el contenedor del modal');
        }
        const checkboxInput = this.modal.modalContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (!checkboxInput) {
            throw new Error('No se encontró el input del checkbox');
        }
        return checkboxInput;
    }
}

export default ImageFormModal;
