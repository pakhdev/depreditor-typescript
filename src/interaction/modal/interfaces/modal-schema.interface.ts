import StructureSchema
    from '../../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';
import Modal from '../modal.ts';
import Processor from '../../../processor/processor.ts';

interface ModalSchema {
    headerText: string;
    content: StructureSchema;
    actionButton?: {
        text: string;
        action: (modal: Modal, processor: Processor) => void;
    };
    cancelButton?: {
        text: string;
        action: (modal: Modal, processor: Processor) => void;
    };
    formattingContainerProperties: ContainerProperties;
}

export default ModalSchema;