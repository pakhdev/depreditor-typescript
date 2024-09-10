import containersConfig from '../../../../core/containers/config.ts';
import ToolbarButton from '../../interfaces/toolbar-button.interface.ts';

const textColor: ToolbarButton = {
    icon: 'icon-set-text-color',
    modalSchema: 'textColor',
    formattingContainerProperties: containersConfig.spanTextColor,
};

export default textColor;