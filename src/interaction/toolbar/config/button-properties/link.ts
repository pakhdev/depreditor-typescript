import ToolbarButton from '../../interfaces/toolbar-button.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';

const link: ToolbarButton = {
    icon: 'icon-insert-link',
    modalSchema: 'linkForm',
    formattingContainerProperties: containersConfig.link,
};

export default link;