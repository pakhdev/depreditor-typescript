import { ContainerProperties } from '../../tools/interfaces';

export class FormattingReader {

    public static nodeMatchType(node: Node, containerProperties: ContainerProperties): NodeMatchType {
        const element = node as HTMLElement;

        if (!this.areAttributesMatching(element, containerProperties) || !this.areClassesMatching(element, containerProperties))
            return NodeMatchType.DIFFERENT;

        return this.compareStyles(FormattingReader.styleToObject(element.style), containerProperties);
    }

    private static areEqualStringArrays = (firstArray: string[], secondArray: string[]): boolean => {
        return JSON.stringify(firstArray.sort()) === JSON.stringify(secondArray.sort());
    };

    // La comprobación de atributos no es estricta, solo se comprobará si los atributos del contenedor están
    // presentes en el elemento, pero no se comprobará si hay atributos adicionales en el elemento.
    // Probablemente en el futuro se pueda añadir una opción para hacer una comprobación estricta.
    private static areAttributesMatching(element: HTMLElement, containerProperties: ContainerProperties): boolean {
        for (const attr in containerProperties.attributes) {
            if (!element.hasAttribute(attr))
                return false;
            if (containerProperties.attributes[attr] && element.getAttribute(attr) !== containerProperties.attributes[attr])
                return false;
        }
        return true;
    }

    private static areClassesMatching(element: HTMLElement, containerProperties: ContainerProperties): boolean {
        const elementClasses = Array.from(element.classList);
        if (elementClasses.length !== (!containerProperties.classes?.length || 0))
            return false;
        if (element.classList.length && !this.areEqualStringArrays(containerProperties.classes!, Array.from(element.classList)))
            return false;
    }

    private static compareStyles(
        elementStyles: { [key: string]: string },
        containerProperties: ContainerProperties,
    ): NodeMatchType {
        let matchType = NodeMatchType.EXACT;

        if (Object.keys(elementStyles).length !== (!containerProperties.styles?.length || 0))
            return NodeMatchType.DIFFERENT;

        if (!containerProperties.styles)
            return NodeMatchType.EXACT;

        for (const style in containerProperties.styles!) {
            if (elementStyles[style] === undefined)
                return NodeMatchType.DIFFERENT;
            if (containerProperties.styles[style] && elementStyles[style] !== containerProperties.styles[style])
                matchType = NodeMatchType.SIMILAR;
        }

        return matchType;
    }

    private static styleToObject(style: CSSStyleDeclaration): { [key: string]: string } {
        return Array.from(style).reduce((acc, propName) => {
            acc[propName] = style.getPropertyValue(propName);
            return acc;
        }, {} as { [key: string]: string });
    };

}
