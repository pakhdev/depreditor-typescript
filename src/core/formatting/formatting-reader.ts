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

}
