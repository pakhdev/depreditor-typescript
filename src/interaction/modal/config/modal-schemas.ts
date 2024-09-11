import ColorPickerModal from './schemas/color-picker.schema.ts';
import ImageFormModal from './schemas/image-form.schema.ts';
import Modal from '../modal.ts';
import ModalSchema from '../interfaces/modal-schema.interface.ts';
import Processor from '../../../processor/processor.ts';
import TableFormModal from './schemas/table-form.schema.ts';

const modalSchemas = (processor: Processor, modal: Modal): ModalSchema[] => ([
    new ColorPickerModal(processor, modal).getSchema('text'),
    new ColorPickerModal(processor, modal).getSchema('background'),
    new TableFormModal(processor, modal).getSchema(),
    new ImageFormModal(processor, modal).getSchema(),
]);

export default modalSchemas;