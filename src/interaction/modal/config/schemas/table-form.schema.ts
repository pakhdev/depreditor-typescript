import StructureSchema
    from '../../../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import ModalSchema from '../../interfaces/modal-schema.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';
import TableCreationProperties
    from '../../../../processor/command-handler/interfaces/table-creation-properties.interface.ts';
import Modal from '../../modal.ts';
import Processor from '../../../../processor/processor.ts';

const tableFormSchema = (processor: Processor, modal: Modal): ModalSchema => {
    return {
        name: 'tableForm',
        headerText: 'Insertar tabla',
        formattingContainerProperties: containersConfig.table,
        content: {
            tagName: 'div',
            attributes: {
                class: 'depreditor-popup__table-form-container',
            },
            children: [
                ...createNumberInputStructure('Cantidad de columnas', 'depreditor-column-num'),
                ...createNumberInputStructure('Cantidad de filas', 'depreditor-row-num'),
            ],
        },
        actionButton: {
            text: 'Insertar',
            action: (modal, processor) => {
                const tableProperties = prepareTableProperties(modal);
                processor.commandHandler.handleElement(tableProperties);
                modal.closeModal();
            },
        },
    };
};

const createNumberInputStructure = (placeholder: string, id: string): StructureSchema[] => ([
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
]);

const prepareTableProperties = (modal: Modal): TableCreationProperties => {
    if (!modal.modalContainer)
        throw new Error('No se encontró el contenedor del modal');

    const rowsInput = modal.modalContainer.querySelector('#depreditor-row-num') as HTMLInputElement;
    const colsInput = modal.modalContainer.querySelector('#depreditor-column-num') as HTMLInputElement;

    if (!rowsInput || !colsInput)
        throw new Error('No se encontraron los inputs de filas y/o columnas');

    return {
        ...containersConfig.table,
        tagName: 'table',
        creationParams: {
            rows: Number(rowsInput.value),
            cols: Number(colsInput.value),
        },
    };
};

export default tableFormSchema;