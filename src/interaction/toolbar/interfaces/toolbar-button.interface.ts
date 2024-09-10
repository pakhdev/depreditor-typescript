import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';

interface ToolbarButton {
    icon: string;
    modalSchema?: string;
    formattingContainerProperties: ContainerProperties;
}

export default ToolbarButton;