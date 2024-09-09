import ToolbarButton from '../../interfaces/toolbar-button.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';

const image: ToolbarButton = {
    icon: 'icon-insert-image',
    modalSchema: 'imageForm',
    formattingContainerProperties: containersConfig.image,
};

export default image;