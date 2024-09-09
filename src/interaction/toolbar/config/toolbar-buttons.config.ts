import ToolbarButton from '../interfaces/toolbar-button.interface.ts';
import strong from './button-properties/strong.ts';
import textBackgroundColor from './button-properties/text-background-color.ts';
import table from './button-properties/table.ts';
import image from './button-properties/image.ts';

const toolbarButtonsConfig: { [key: string]: ToolbarButton } = {
    strong,
    textBackgroundColor,
    table,
    image,
};

export default toolbarButtonsConfig;