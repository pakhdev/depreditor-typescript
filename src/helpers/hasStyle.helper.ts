import { FormattingName } from '../types';
import { toolsConfig } from '../tools.config.ts';

export const hasStyle = (formattingName: FormattingName, node: Node): boolean => {
    if (node.nodeType === Node.TEXT_NODE) return false;
    const element = node as HTMLElement;
    const tool = toolsConfig.find(tool => tool.name === formattingName);
    if (!tool) return false;

    if (element.tagName.toLowerCase() !== tool.tag) return false;
    if (tool.classes) {
        for (const className of tool.classes) {
            if (!element.classList.contains(className))
                return false;
        }
    }
    if (tool.styles) {
        for (const styleName in tool.styles) {
            if (!element.style[styleName])
                return false;

            if (tool.styles[styleName] !== '' && element.style[styleName] !== tool.styles[styleName])
                return false;
        }
    }
    if (tool.attributes) {
        for (const attributeName in tool.attributes) {
            if (!element.hasAttribute(attributeName))
                return false;
            if (tool.attributes[attributeName] !== '' && element.getAttribute(attributeName) !== tool.attributes[attributeName])
                return false;
        }
    }
    return true;
};