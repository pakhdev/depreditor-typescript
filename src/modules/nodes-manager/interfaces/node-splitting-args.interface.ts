import { Topology } from '../../topology/topology.ts';

export interface NodeSplittingArgs {
    parent: Topology;
    topology: Topology;
    ranges: number[];
    partiallySelectedTopologies: Topology[];
}