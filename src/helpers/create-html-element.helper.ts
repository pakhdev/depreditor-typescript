type Styles = { [styleKey: string]: string };
type Classes = string[];

export const createHtmlElement = (tagName: string, attributes: {
    [key: string]: string | Styles | Classes
}): HTMLElement => {
    const element = document.createElement(tagName);
    for (const key in attributes) {
        const value = attributes[key];
        if (key === 'classes') element.classList.add(...value as Classes);
        else if (key === 'styles')
            for (const [styleKey, styleValue] of Object.entries(value as Styles))
                element.style.setProperty(styleKey, styleValue);
        else element.setAttribute(key, value as string);
    }
    return element;
};
