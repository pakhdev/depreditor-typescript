import { NodePath } from './node-path.type.ts';
import { SelectedNode } from './selected-node.type.ts';

export type InsertingOptions = {
    nodes: SelectedNode[];
    position: NodePath;
    removeNodesCount?: number;
    startNode?: Node;
    endNode?: Node;
}
