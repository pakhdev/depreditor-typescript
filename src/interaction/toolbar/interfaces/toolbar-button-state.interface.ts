import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';

interface ToolbarButtonState {
    activated: boolean;
    modalSchema?: string;
    formattingContainerProperties: ContainerProperties;
}

export default ToolbarButtonState;