import { Topology } from '../topology/topology.ts';
import { TopologyBuilder } from '../topology/helpers/topology-builder.ts';

export class ContentState {

    private readonly contentTopology: Topology;

    constructor(editableDiv: HTMLDivElement) {
        this.contentTopology = TopologyBuilder.build(editableDiv);
    }

    public get selected(): Topology {
        // TODO: Implementar devolución de topologías seleccionadas
    }

    public findByNode(node: Node): Topology {
        // TODO: Implementar búsqueda de topología por nodo
    }

}
