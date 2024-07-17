import containersConfig from './config.ts';
import ContainerProperties from './interfaces/container-properties.interface.ts';
import MatchingStatus from './enums/matching-status.enum.ts';

class ContainerIdentifier {

    public static identify(element: HTMLElement | Node): ContainerProperties | null {
        if (element.nodeType === Node.TEXT_NODE)
            return null;

        for (const key in containersConfig) {
            if ((element as HTMLElement).tagName.toLowerCase() !== containersConfig[key].tagName.toLowerCase())
                continue;

            if (!this.areAttributesMatching(element as HTMLElement, containersConfig[key]))
                continue;

            if (!this.areClassesMatching(element as HTMLElement, containersConfig[key]))
                continue;

            if (this.areStylesMatching(element as HTMLElement, containersConfig[key]) === MatchingStatus.EXACT)
                return containersConfig[key];
        }
        return null;
    }

    // La comprobación de atributos no es estricta, solo se comprobará si los atributos del contenedor están
    // presentes en el elemento, pero no se comprobará si hay atributos adicionales en el elemento.
    // Probablemente en el futuro se pueda añadir una opción para hacer una comprobación estricta.
    public static areAttributesMatching(
        elementOrProperties: HTMLElement | ContainerProperties,
        referenceProperties: ContainerProperties,
    ): boolean {
        const referenceAttributes = 'attributes' in referenceProperties
            ? referenceProperties.attributes
            : {};

        for (const attribute in referenceAttributes) {
            if (elementOrProperties instanceof HTMLElement) {
                const element = elementOrProperties as HTMLElement;
                if (!element.hasAttribute(attribute))
                    return false;
                if (referenceAttributes[attribute] && element.getAttribute(attribute) !== referenceAttributes[attribute])
                    return false;
            } else {
                const elementProps = elementOrProperties as ContainerProperties;
                if (!elementProps.attributes || elementProps.attributes[attribute] !== referenceAttributes[attribute])
                    return false;
            }
        }
        return true;
    }

    public static areClassesMatching(
        elementOrProperties: HTMLElement | ContainerProperties,
        referenceProperties: ContainerProperties,
    ): boolean {
        const classesToCompare: string[] = elementOrProperties instanceof HTMLElement
            ? Array.from(elementOrProperties.classList)
            : (elementOrProperties as ContainerProperties).classes || [];
        const referenceClasses: string[] = referenceProperties.classes || [];

        if (classesToCompare.length !== referenceClasses.length)
            return false;

        return this.areEqualStringArrays(classesToCompare, referenceClasses);
    }

    public static areStylesMatching(
        elementOrProperties: HTMLElement | ContainerProperties,
        referenceProperties: ContainerProperties,
    ): MatchingStatus {
        const stylesToCompare: { [key: string]: string } = elementOrProperties instanceof HTMLElement
            ? this.styleToObject(elementOrProperties.style)
            : elementOrProperties.styles || {};
        const referenceStyles = referenceProperties.styles || {};

        if (Object.keys(stylesToCompare).length !== Object.keys(referenceStyles).length)
            return MatchingStatus.DIFFERENT;

        let matchType = MatchingStatus.EXACT;
        for (const style in referenceStyles) {
            if (stylesToCompare[style] === undefined)
                return MatchingStatus.DIFFERENT;
            if (referenceStyles[style] && stylesToCompare[style] !== referenceStyles[style])
                matchType = MatchingStatus.SIMILAR;
        }

        return matchType;
    }

    private static styleToObject(style: CSSStyleDeclaration): { [key: string]: string } {
        return Array.from(style).reduce((acc, propName) => {
            acc[propName] = style.getPropertyValue(propName);
            return acc;
        }, {} as { [key: string]: string });
    };

    private static areEqualStringArrays(firstArray: string[], secondArray: string[]): boolean {
        return JSON.stringify(firstArray.sort()) === JSON.stringify(secondArray.sort());
    };

}

export default ContainerIdentifier;