import { Topology } from '../topology.ts';

export class TopologyBuilder {

    static build(node: Node): Topology {
        const topology = new Topology(node);
        if (topology.node.hasChildNodes())
            this.scanChildNodes(topology);
        // TODO: Proxy children properties
        return topology;
    }

    private static scanChildNodes(topology: Topology): void {
        const childNodes = Array.from(topology.node.childNodes);
        childNodes.forEach((childNode) => topology.children.push(
            this.build(childNode).setParent(topology),
        ));
    }
}
