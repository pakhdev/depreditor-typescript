import { Topology } from '../topology.ts';

export class TopologyMounter {

    /**
     * Inserta la topología del buffer en la posición indicada.
     */
    static mount(topology: Topology, path: number[]): Topology {
        const { ownerEditor, node } = topology;
        const position = path.pop();

        if (topology.isPlacedInDom || !ownerEditor || position === undefined)
            throw new Error('La topología no está lista para ser montada');

        const parentNode = path.length
            ? this.findByPath(ownerEditor as Node, path)
            : topology.ownerEditor;
        if (!parentNode || parentNode.childNodes.length - 1 < position)
            throw new Error('No se encontró el nodo padre o la posición de referencia');

        parentNode.insertBefore(node, parentNode.childNodes[position!]);
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

    private static findByPath(node: Node, path: number[]): Node | null {
        let currentNode: Node | null = node;
        for (const index of path) {
            if (!currentNode || !currentNode.childNodes)
                return null;
            currentNode = currentNode.childNodes[index];
        }
        return currentNode;
    }

}