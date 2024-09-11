import ToolbarButton from '../interfaces/toolbar-button.interface.ts';
import strong from './button-properties/strong.ts';
import textBackgroundColor from './button-properties/text-background-color.ts';
import table from './button-properties/table.ts';
import image from './button-properties/image.ts';
import italic from './button-properties/italic.ts';
import underline from './button-properties/underline.ts';
import code from './button-properties/code.ts';
import listNumbered from './button-properties/list-numbered.ts';
import listDots from './button-properties/list-dots.ts';
import paragraphLeft from './button-properties/paragraph-left.ts';
import paragraphRight from './button-properties/paragraph-right.ts';
import paragraphCenter from './button-properties/paragraph-center.ts';
import hidden from './button-properties/hidden.ts';
import link from './button-properties/link.ts';
import textColor from './button-properties/text-color.ts';

const toolbarButtonsConfig: { [key: string]: ToolbarButton } = {
    strong,
    italic,
    underline,
    code,
    listNumbered,
    listDots,
    paragraphLeft,
    paragraphRight,
    paragraphCenter,
    hidden,
    table,
    link,
    image,
    textColor,
    textBackgroundColor,
};

export default toolbarButtonsConfig;