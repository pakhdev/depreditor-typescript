import { NodeSelection } from './node-selection.interface.ts';

export interface NodesTopology extends NodeSelection {
    children: NodesTopology[];
    path: number[];
}