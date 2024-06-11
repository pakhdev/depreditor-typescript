import { SelectionData } from '../interfaces/selection-data.interface.ts';
import { Topology } from '../../topology/topology.ts';

export class StateSelection {

    public static set(contentTopology: Topology, selectionData: SelectionData): void {
        this.reset(contentTopology);
        const commonAncestorTopology = contentTopology.find.byNode(selectionData.commonAncestor);
        if (!commonAncestorTopology)
            throw new Error('No se ha encontrado el ancestro común');

        const state = { startFound: false, endFound: false };
        this.markSelection(commonAncestorTopology, selectionData, state);
    }

    private static markSelection(topology: Topology, selectionData: SelectionData, state: {
        startFound: boolean,
        endFound: boolean
    }): void {

        if (topology.node === selectionData.startNode.node) {
            state.startFound = true;
            topology.setStart(selectionData.startNode.start).setEnd(selectionData.startNode.end);
        }

        if (topology.node === selectionData.endNode.node) {
            state.endFound = true;
            topology.setStart(selectionData.endNode.start).setEnd(selectionData.endNode.end);
        }

        let startMarked = false;

        for (const childTopology of topology.children) {
            this.markSelection(childTopology, selectionData, state);
            if (state.startFound && !startMarked) {
                topology.setStart(childTopology.position);
                startMarked = true;
            }
            if (state.startFound)
                topology.setEnd(childTopology.position + 1);

            if (state.endFound)
                break;
        }
    }

    private static reset(topology: Topology): void {
        topology.setStart(0).setEnd(0);
        for (const childTopology of topology.children)
            this.reset(childTopology);
    }

}
