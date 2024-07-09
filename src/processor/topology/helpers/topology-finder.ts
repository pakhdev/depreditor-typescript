import { Topology } from '../topology.ts';

export class TopologyFinder {

    constructor(private readonly topology: Topology) {}

    public rootTopology(): Topology {
        let parentTopology = this.topology;
        while (parentTopology.parent)
            parentTopology = parentTopology.parent;
        return parentTopology;
    }

    public byNode(node: Node): Topology | null {
        const rootTopology = this.rootTopology();
        if (rootTopology.node === node)
            return rootTopology;
        return this.byChildrenNode(node, rootTopology);
    }

    public byChildrenNode(node: Node, topology: Topology = this.topology): Topology | null {
        for (const childTopology of topology.children) {
            if (childTopology.node === node)
                return childTopology;
            if (childTopology.children.length) {
                const found = this.byChildrenNode(node, childTopology);
                if (found)
                    return found;
            }
        }
        return null;
    }

}
