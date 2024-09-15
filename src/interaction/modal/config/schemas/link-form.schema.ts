import Processor from '../../../../processor/processor.ts';
import Modal from '../../modal.ts';
import containersConfig from '../../../../core/containers/config.ts';
import FormattingCoverage from '../../../../processor/utilities/formatting-reader/enums/formatting-coverage.enum.ts';
import ModalSchema from '../../interfaces/modal-schema.interface.ts';
import StructureSchema
    from '../../../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import ModalSchemaProvider from '../../interfaces/modal-schema-provider.interface.ts';

class LinkFormModal implements ModalSchemaProvider {

    constructor(private processor: Processor, private modal: Modal) {}

    public getSchema(): ModalSchema {
        const { value, buttonText } = this.analyzeCurrentSelection();
        return {
            headerText: 'Insertar enlace',
            formattingContainerProperties: containersConfig.image,
            content: this.createContent(value),
            actionButton: this.createActionButton(buttonText),
        };
    }

    private createContent(inputValue: string): StructureSchema {
        return {
            tagName: 'div',
            attributes: {
                class: 'depreditor-popup__centering-container',
            },
            children: [
                this.createLinkInputStructure(inputValue),
            ],
        };
    }

    private createLinkInputStructure(inputValue: string): StructureSchema {
        return {
            tagName: 'input',
            attributes: {
                type: 'text',
                class: 'depreditor-input',
                placeholder: 'Dirección del enlace',
                value: inputValue,
            },
        };
    }

    private createActionButton(buttonText: string): { text: string; action: (modal: Modal) => void } {
        return {
            text: buttonText,
            action: () => {
                const fileInput = this.getLinkInput();
                this.processor.commandHandler.handleElement({
                    ...containersConfig.link,
                    attributes: {
                        href: fileInput.value,
                    },
                });
                this.modal.closeModal();
            },
        };
    }

    private getLinkInput(): HTMLInputElement {
        if (!this.modal.modalContainer) {
            throw new Error('No se encontró el contenedor del modal');
        }
        const fileInput = this.modal.modalContainer.querySelector('input[type="text"]') as HTMLInputElement;
        if (!fileInput) {
            throw new Error('No se encontró el input del enlace');
        }
        return fileInput;
    }

    private analyzeCurrentSelection(): { value: string, buttonText: string } {
        const formatting = this.processor.formattingReader.getCurrentFormatting();
        console.log('format123ting', formatting);
        const linkFormatting = formatting.entries.find(entry => entry.formatting === containersConfig.link);
        if (linkFormatting && linkFormatting.coverage === FormattingCoverage.FULL && linkFormatting.nodes.length === 1) {
            const linkNode = linkFormatting.nodes[0] as HTMLAnchorElement;
            return { value: linkNode.href, buttonText: 'Guardar cambios' };
        } else {
            return { value: '', buttonText: 'Insertar enlace' };
        }
    }
}

export default LinkFormModal;
