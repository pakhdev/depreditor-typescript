import ModalSchema from '../interfaces/modal-schema.interface.ts';
import Processor from '../../../processor/processor.ts';
import colorPickerSchema from './schemas/color-picker.schema.ts';

const modalSchemas = (processor: Processor): ModalSchema[] => ([
    colorPickerSchema(processor, 'text'),
    colorPickerSchema(processor, 'background'),
]);

export default modalSchemas;