import ColorPickerModal from './schemas/color-picker.schema.ts';
import ImageFormModal from './schemas/image-form.schema.ts';
import Modal from '../modal.ts';
import Processor from '../../../processor/processor.ts';
import TableFormModal from './schemas/table-form.schema.ts';
import ModalSchemaConfig from '../interfaces/modal-schema-config.interface.ts';
import LinkFormModal from './schemas/link-form.schema.ts';

const modalSchemasConfig = (processor: Processor, modal: Modal): ModalSchemaConfig => ({
    textColor: { provider: new ColorPickerModal(processor, modal), type: 'text' },
    backgroundColor: { provider: new ColorPickerModal(processor, modal), type: 'background' },
    tableForm: { provider: new TableFormModal(processor, modal) },
    imageForm: { provider: new ImageFormModal(processor, modal) },
    linkForm: { provider: new LinkFormModal(processor, modal) },
});

export default modalSchemasConfig;