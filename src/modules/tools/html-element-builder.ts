import { Attributes, Classes, StructureSchema, Styles } from './interfaces';

export class HtmlElementBuilder {
    public static createElement(tagName: string, attributes: Attributes): HTMLElement {
        const element = document.createElement(tagName);

        for (const key in attributes) {
            const value = attributes[key];
            const attrType = this.getAttributeType(key, value);

            switch (attrType) {
                case 'classes':
                    this.handleClasses(element, value as Classes);
                    break;

                case 'styles':
                    this.handleStyles(element, value as Styles);
                    break;

                case 'event':
                    this.handleEvent(element, key, value as EventListenerOrEventListenerObject);
                    break;

                default:
                    element.setAttribute(key, value as string);
                    break;
            }
        }

        return element;
    }

    public static createStructure(schema: StructureSchema): HTMLElement {
        const element = this.createElement(schema.tagName, schema.attributes);

        if (schema.children) {
            for (const childSchema of schema.children) {
                const childElement = this.createStructure(childSchema);
                element.appendChild(childElement);
            }
        }

        return element;
    }

    private static getAttributeType(key: string, value: unknown): string {
        switch (true) {
            case key === 'classes':
                return 'classes';
            case key === 'styles':
                return 'styles';
            case key.startsWith('on') && typeof value === 'function':
                return 'event';
            default:
                return 'attribute';
        }
    }

    private static handleClasses(element: HTMLElement, value: Classes) {
        element.classList.add(...value);
    }

    private static handleStyles(element: HTMLElement, value: Styles) {
        for (const [styleKey, styleValue] of Object.entries(value)) {
            element.style.setProperty(styleKey, styleValue);
        }
    }

    private static handleEvent(element: HTMLElement, key: string, value: EventListenerOrEventListenerObject) {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
    }
}