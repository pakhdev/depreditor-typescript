import { SelectedNode } from './selected-node.type.ts';

export type NodesSelection = (SelectedNode | NodesSelection)[]