import { Topology } from '../topology.ts';

export class TopologyMounter {

    /**
     * Inserta la topología del buffer en la posición indicada en las propiedades de la topología.
     */
    static mount(topology: Topology, path: number[]): Topology {
        return topology;
    }

    /**
     * Desmonta el nodo del DOM y elimina la topología de su nodo padre.
     * Se actualizarán los índices de inicio y fin y las rutas de las topologías afectadas.
     */
    static unmount(topology: Topology): void {
        if (!topology.parent)
            throw new Error('No se encontró el nodo padre');
        if (topology.isPlacedInDom)
            throw new Error('No se puede desmontar una topología que no se encuentra en el DOM');

        const topologyChildIdx = topology.parent.children.indexOf(topology);
        if (topologyChildIdx === -1)
            throw new Error('No se encontró la topología de referencia en su nodo padre');

        topology.parent.children.splice(topologyChildIdx, 1);
        topology.parentNode.removeChild(topology.node);
    }

}