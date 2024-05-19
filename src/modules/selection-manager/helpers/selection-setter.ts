import { NodeSelection } from './node-selection.ts';
import { Topology } from '../../topology/topology.ts';

/**
 * Clase para establecer la selección actual.
 */
export class SelectionSetter {

    public static setFromTopology(topology: Topology): {
        isRange: boolean;
        commonAncestor: Node | null;
        startNode: NodeSelection | null;
        endNode: NodeSelection | null;
    } {
        const selection = window.getSelection();
        if (!selection)
            throw new Error('No se pudo obtener la selección actual del documento.');

        const range = document.createRange();
        const { firstSelected, lastSelected } = topology;

        if (!firstSelected.isPlacedInDom || !lastSelected.isPlacedInDom)
            throw new Error('No se pudo establecer la selección porque los nodos no están en el DOM.');

        range.setStart(firstSelected.node, firstSelected.start);
        range.setEnd(lastSelected.node, lastSelected.end);
        selection.removeAllRanges();
        selection.addRange(range);

        const startSelectionNode = new NodeSelection(firstSelected.node)
            .setStart(firstSelected.start)
            .setEnd(firstSelected.end);
        const endSelectionNode = new NodeSelection(lastSelected.node)
            .setStart(lastSelected.start)
            .setEnd(lastSelected.end);

        return {
            isRange: topology.isRange,
            commonAncestor: range.commonAncestorContainer,
            startNode: startSelectionNode,
            endNode: endSelectionNode,
        };
    }
}