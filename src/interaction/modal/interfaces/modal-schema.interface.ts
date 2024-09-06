import StructureSchema
    from '../../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';

interface ModalSchema {
    name: string;
    headerText: string;
    content: StructureSchema;
    actionButtonText?: string;
    formattingContainerProperties: ContainerProperties;
}

export default ModalSchema;