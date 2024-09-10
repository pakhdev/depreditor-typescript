import ToolbarButton from '../../interfaces/toolbar-button.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';

const listNumbered: ToolbarButton = {
    icon: 'icon-set-list-numbered',
    formattingContainerProperties: containersConfig.ol,
};

export default listNumbered;