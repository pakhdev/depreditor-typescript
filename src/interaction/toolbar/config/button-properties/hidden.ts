import ToolbarButton from '../../interfaces/toolbar-button.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';

const hidden: ToolbarButton = {
    icon: 'icon-set-hidden',
    formattingContainerProperties: containersConfig.divHidden,
};

export default hidden;