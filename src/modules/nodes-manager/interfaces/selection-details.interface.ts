import { NodeSelection } from './node-selection.interface.ts';

export interface SelectionDetails {
    editableDiv: HTMLDivElement;
    isRange: boolean;
    sameNode: boolean;
    commonAncestor: Node;
    startNode: NodeSelection;
    endNode: NodeSelection;
}