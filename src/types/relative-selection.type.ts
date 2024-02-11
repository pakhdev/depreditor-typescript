import { NodePath } from './node-path.type.ts';

export type RelativeSelection = {
    startNode: NodePath;
    startOffset: number;
    endNode: NodePath;
    endOffset: number;
}