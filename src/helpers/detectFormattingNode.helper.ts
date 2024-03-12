import { toolsConfig } from '../tools.config.ts';
import { ContainerProps } from '../types/container-props.type.ts';

export const detectFormattingNode = (node: Node): ContainerProps | void => {
    if (node.nodeType === Node.TEXT_NODE) return;
    const element = node as HTMLElement;
    let tools = toolsConfig
        .filter(tool => tool.tag.toLowerCase() === element.tagName.toLowerCase())
        .filter(tool => element.classList.length
            ? tool.classes && areEqualStringArrays(tool.classes, Array.from(element.classList))
            : !tool.classes)
        .filter(tool => element.classList.length
            ? tool.classes && areEqualStringArrays(tool.classes, Array.from(element.classList))
            : !tool.classes,
        )
        .filter(tool => element.hasAttribute('style')
            ? tool.styles && validateProperties(styleToObject(element.style), tool.styles)
            : !tool.styles)
        .filter(tool => element.hasAttributes()
            ? tool.attributes && validateProperties(attributesToObject(element.attributes), tool.attributes)
            : !tool.attributes);
    if (tools.length === 1) return tools[0];
};

const areEqualStringArrays = (firstArray: string[], secondArray: string[]): boolean => {
    return JSON.stringify(firstArray.sort()) === JSON.stringify(secondArray.sort());
};

const validateProperties = (elementProps: { [key: string]: string }, toolProps: { [key: string]: string }): boolean => {
    const elementPropKeys = Object.keys(elementProps);
    const toolPropKeys = Object.keys(toolProps);
    if (elementPropKeys.length !== toolPropKeys.length) return false;
    for (const prop of elementPropKeys) {
        if (!toolProps[prop]) return false;
        if (toolProps[prop] === '') continue;
        if (elementProps[prop] !== toolProps[prop])
            return false;
    }
    return true;
};

const attributesToObject = (attributes: NamedNodeMap): { [key: string]: string } => {
    return Array.from(attributes).reduce((acc, attr) => {
        if (attr.name.toLowerCase() !== 'style')
            acc[attr.name] = attr.value;
        return acc;
    }, {} as { [key: string]: string });
};

const styleToObject = (style: CSSStyleDeclaration): { [key: string]: string } => {
    return Array.from(style).reduce((acc, propName) => {
        acc[propName] = style.getPropertyValue(propName);
        return acc;
    }, {} as { [key: string]: string });
};