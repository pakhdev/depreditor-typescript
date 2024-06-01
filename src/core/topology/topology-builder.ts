import { Topology } from '../../modules/topology/topology.ts';

export class TopologyBuilder {

    static fromNode(node: Node): Topology {
        const topology = new Topology(node);
        if (topology.node.hasChildNodes())
            this.scanChildNodes(topology);
        // TODO: Proxy children properties
        return topology;
    }

    private static scanChildNodes(topology: Topology): void {
        const childNodes = Array.from(topology.node.childNodes);
        childNodes.forEach((childNode) => topology.children.push(
            this.fromNode(childNode).setParent(topology),
        ));
    }
}
