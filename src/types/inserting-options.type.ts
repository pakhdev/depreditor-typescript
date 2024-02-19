import { SelectedNode } from './selected-node.type.ts';
import { NodePath } from './node-path.type.ts';

export type InsertingOptions = {
    nodes: SelectedNode[];
    ancestorPath?: NodePath;
    position: number;
    removeNodesCount?: number;
    startNode?: Node;
    endNode?: Node;
}
