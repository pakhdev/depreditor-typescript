import { Attributes, Classes, Styles } from '../../../core/containers/interfaces';
import StructureSchema from './interfaces/structure-schema.interface.ts';

// Creación de elementos y estructuras HTML con atributos y eventos
// Ejemplo:
// const myElement: Attributes = {
//     id: "myDiv",
//     classes: ["container", "highlight", "rounded"],
//     styles: {
//         color: "red",
//         backgroundColor: "lightgray",
//         padding: "10px",
//         border: "1px solid black"
//     },
//     onclick: (event: Event) => {
//         console.log("Div clicked!", event);
//     },
//     "data-custom": "myCustomValue",
// };
class HtmlElementBuilder {
    public static createElement(tagName: string, attributes?: Attributes): HTMLElement {
        const element = document.createElement(tagName);
        if (!attributes) return element;

        for (const key in attributes) {
            const value = attributes[key];
            const attrType = this.getAttributeType(key, value);
            if (!value) continue;

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

                case 'textContent':
                    element.textContent = value as string;
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
            case key === 'textContent':
                return 'textContent';
            default:
                return 'attribute';
        }
    }

    private static handleClasses(element: HTMLElement, value: Classes): void {
        element.classList.add(...value);
    }

    private static handleStyles(element: HTMLElement, value: Styles): void {
        for (let [styleKey, styleValue] of Object.entries(value)) {
            styleKey = styleKey.replace(/[A-Z]/g, match => `-${ match.toLowerCase() }`);
            element.style.setProperty(styleKey, styleValue);
        }
    }

    private static handleEvent(element: HTMLElement, key: string, value: EventListenerOrEventListenerObject): void {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
    }
}

export default HtmlElementBuilder;