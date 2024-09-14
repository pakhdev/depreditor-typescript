import Modal from '../../modal.ts';
import ModalSchema from '../../interfaces/modal-schema.interface.ts';
import Processor from '../../../../processor/processor.ts';
import StructureSchema
    from '../../../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import TableCreationProperties
    from '../../../../processor/command-handler/interfaces/table-creation-properties.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';
import ModalSchemaProvider from '../../interfaces/modal-schema-provider.interface.ts';

class TableFormModal implements ModalSchemaProvider {
    constructor(private processor: Processor, private modal: Modal) {}

    public getSchema(): ModalSchema {
        return {
            headerText: 'Insertar tabla',
            formattingContainerProperties: containersConfig.table,
            content: this.createContent(),
            actionButton: this.createActionButton(),
        };
    }

    private createContent(): StructureSchema {
        return {
            tagName: 'div',
            attributes: {
                class: 'depreditor-popup__table-form-container',
            },
            children: [
                ...this.createNumberInputStructure('Cantidad de columnas', 'depreditor-column-num'),
                ...this.createNumberInputStructure('Cantidad de filas', 'depreditor-row-num'),
            ],
        };
    }

    private createNumberInputStructure(placeholder: string, id: string): StructureSchema[] {
        return [
            {
                tagName: 'label',
                attributes: {
                    for: id,
                    innerText: placeholder,
                },
            },
            {
                tagName: 'input',
                attributes: {
                    type: 'number',
                    value: '1',
                    id,
                    class: 'depreditor-popup__input',
                },
            },
        ];
    }

    private createActionButton(): { text: string; action: (modal: Modal, processor: Processor) => void } {
        return {
            text: 'Insertar',
            action: () => {
                const tableProperties = this.prepareTableProperties();
                this.processor.commandHandler.handleElement(tableProperties);
                this.modal.closeModal();
            },
        };
    }

    private prepareTableProperties(): TableCreationProperties {
        const modalContainer = this.modal.modalContainer;
        if (!modalContainer) {
            throw new Error('No se encontró el contenedor del modal');
        }

        const rowsInput = modalContainer.querySelector('#depreditor-row-num') as HTMLInputElement;
        const colsInput = modalContainer.querySelector('#depreditor-column-num') as HTMLInputElement;

        if (!rowsInput || !colsInput) {
            throw new Error('No se encontraron los inputs de filas y/o columnas');
        }

        return {
            ...containersConfig.table,
            tagName: 'table',
            creationParams: {
                rows: Number(rowsInput.value),
                cols: Number(colsInput.value),
            },
        };
    }
}

export default TableFormModal;
