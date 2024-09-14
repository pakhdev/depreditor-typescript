import ImageCreationProperties
    from '../../../../processor/command-handler/interfaces/image-creation-properties.interface.ts';
import ImageLimits from '../../../../processor/command-handler/interfaces/image-limits.inteface.ts';
import Modal from '../../modal.ts';
import ModalSchema from '../../interfaces/modal-schema.interface.ts';
import Processor from '../../../../processor/processor.ts';
import StructureSchema
    from '../../../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';
import ModalSchemaProvider from '../../interfaces/modal-schema-provider.interface.ts';

class ImageFormModal implements ModalSchemaProvider {
    private imageLimits: ImageLimits = {
        maxInitialImageWidth: 800,
        maxInitialImageHeight: 600,
        maxLargeImageWidth: 300,
        maxLargeImageHeight: 1600,
        minResolutionDifference: 1200,
    };

    constructor(private processor: Processor, private modal: Modal) {}

    public getSchema(): ModalSchema {
        return {
            headerText: 'Insertar imagen',
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
                type: 'file',
                accept: 'image/*',
                style: 'display: none',
                onchange: () => {
                    this.processor.commandHandler.handleElement(this.prepareImageProperties());
                    this.modal.closeModal();
                },
            },
        };
    }

    private createActionButton(): { text: string; action: (modal: Modal) => void } {
        return {
            text: 'Seleccionar imágen',
            action: () => {
                const fileInput = this.getFileInput();
                fileInput.click();
            },
        };
    }

    private prepareImageProperties(): ImageCreationProperties {
        const fileInput = this.getFileInput();
        const checkboxInput = this.getCheckboxInput();

        return {
            ...containersConfig.image,
            tagName: 'img',
            creationParams: {
                fileInput,
                userWantsLargeImage: checkboxInput.checked,
                imageLimits: this.imageLimits,
            },
        };
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
