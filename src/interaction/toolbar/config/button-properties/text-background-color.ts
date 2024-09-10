import containersConfig from '../../../../core/containers/config.ts';
import ToolbarButton from '../../interfaces/toolbar-button.interface.ts';

const textBackgroundColor: ToolbarButton = {
    icon: 'icon-set-text-background-color',
    modalSchema: 'backgroundColor',
    formattingContainerProperties: containersConfig.spanTextBackgroundColor,
};

export default textBackgroundColor;