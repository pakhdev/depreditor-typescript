export interface NodeCloningResult {
    clonedNode: Node;
    nodeMappings: { originalNode: Node; clonedNode: Node }[];
}
