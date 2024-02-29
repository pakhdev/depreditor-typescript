import { NodeSelection } from './node-selection.interface.ts';

export interface SelectionDetails {
    isRange: boolean;
    sameNode: boolean;
    commonAncestor: Node;
    startNode: NodeSelection;
    endNode: NodeSelection;
}