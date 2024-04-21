import { Topology } from '../../topology/topology.ts';

export interface RangeCloningArgs {
    parentTopology: Topology;
    firstTopology: Topology;
    lastTopology: Topology;
    position: 'before' | 'within' | 'after';
}