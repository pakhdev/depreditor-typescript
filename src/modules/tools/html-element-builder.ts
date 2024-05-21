import { Attributes, Classes, Styles } from './interfaces';

export class HtmlElementFactory {
    public static createElement(tagName: string, attributes: Attributes): HTMLElement {
        const element = document.createElement(tagName);

        for (const key in attributes) {
            const value = attributes[key];
            const attrType = HtmlElementFactory.getAttributeType(key, value);

            switch (attrType) {
                case 'classes':
                    HtmlElementFactory.handleClasses(element, value as Classes);
                    break;

                case 'styles':
                    HtmlElementFactory.handleStyles(element, value as Styles);
                    break;

                case 'event':
                    HtmlElementFactory.handleEvent(element, key, value as EventListenerOrEventListenerObject);
                    break;

                default:
                    element.setAttribute(key, value as string);
                    break;
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