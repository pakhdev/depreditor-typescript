import ToolbarButton from '../../interfaces/toolbar-button.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';

const table: ToolbarButton = {
    icon: 'icon-insert-table',
    modalSchema: 'tableForm',
    formattingContainerProperties: containersConfig.table,
};

export default table;