import { Topology } from '../topology.ts';

export interface TopologyCloningResult {
    clonedTopology: Topology,
    retrievedTopology: Topology | null
}