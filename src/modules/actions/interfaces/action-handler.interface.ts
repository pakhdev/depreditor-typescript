import { NodesManager } from '../../nodes-manager/nodes-manager.ts';

export interface ActionHandler {
    (selectedNodes: NodesManager | null, event?: Event): void;
}