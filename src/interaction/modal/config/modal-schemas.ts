import ModalSchema from '../interfaces/modal-schema.interface.ts';
import Processor from '../../../processor/processor.ts';
import colorPickerSchema from './schemas/color-picker.schema.ts';
import Modal from '../modal.ts';
import tableFormSchema from './schemas/table-form.schema.ts';

const modalSchemas = (processor: Processor, modal: Modal): ModalSchema[] => ([
    colorPickerSchema(processor, 'text'),
    colorPickerSchema(processor, 'background'),
    tableFormSchema(processor, modal),
]);

export default modalSchemas;