import { NodeSelection } from '../helpers/node-selection.ts';

export interface SelectionData {
    isRange: boolean;
    commonAncestor: Node;
    startNode: NodeSelection;
    endNode: NodeSelection;
}