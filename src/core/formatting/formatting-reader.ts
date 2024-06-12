import { containersConfig } from './containers-config.ts';
import { ContainerProperties } from './interfaces/container-properties.interface.ts';
import { MatchingStatus } from './enums/matching-status.enum.ts';
import { Topology } from '../topology/topology.ts';
import { FormattingNodes } from './interfaces/formatting-nodes.interface.ts';

export class FormattingReader {

    public static getTopologyFormatting(topology: Topology): FormattingNodes {
        const formattingNodes: FormattingNodes = {};
        let topologyParent: Topology | null = topology;
        while (topologyParent) {
            const formattingName = this.getNodeFormattingName(topologyParent.node as HTMLElement);
            if (formattingName)
                formattingNodes[formattingName] = topologyParent.node;
            topologyParent = topology.parent;
        }
        return formattingNodes;
    }

    public static getFormattingCoverage(topology: Topology, referenceProperties: ContainerProperties) {
        // Obtener los formatos similares a las propiedades de referencia
        // Obtener getTopologyFormatting de la topología y comprobar si contiene el formato exacto o similar
        // Si el paso anterior no dio resultado - escanear los nodos hijos de la topología
        // Devolver: full, partial o none
    }

    private static getNodeFormattingName(node: HTMLElement): keyof typeof containersConfig | null {
        for (const key in containersConfig) {
            if (this.areMatchingContainers(node, containersConfig[key]) === MatchingStatus.EXACT)
                return key;
        }
        return null;
    }

    private static areMatchingContainers(
        elementOrProperties: HTMLElement | ContainerProperties,
        referenceProperties: ContainerProperties,
    ): MatchingStatus {

        if (elementOrProperties.tagName.toLowerCase() !== referenceProperties.tagName.toLowerCase())
            return MatchingStatus.DIFFERENT;

        if (!this.areAttributesMatching(elementOrProperties, referenceProperties))
            return MatchingStatus.DIFFERENT;

        if (!this.areClassesMatching(elementOrProperties, referenceProperties))
            return MatchingStatus.DIFFERENT;

        return this.areStylesMatching(elementOrProperties, referenceProperties);
    }

    // La comprobación de atributos no es estricta, solo se comprobará si los atributos del contenedor están
    // presentes en el elemento, pero no se comprobará si hay atributos adicionales en el elemento.
    // Probablemente en el futuro se pueda añadir una opción para hacer una comprobación estricta.
    private static areAttributesMatching(
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

    private static areClassesMatching(
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

    private static areStylesMatching(
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
