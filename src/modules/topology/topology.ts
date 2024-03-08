import { SelectionDetails } from '../nodes-manager/interfaces';
import { getNodePath } from '../../helpers/nodeRouter.helper.ts';

export class Topology {
    public node: Node | null = null;
    public start: number = 0;
    public end: number = 0;
    public length: number = 0;
    public path: number[] = [];
    public children: Topology[] = [];
    public parent: Topology | null = null;

    get fullySelected(): boolean {
        return this.start === 0 && this.end === this.length - 1;
    }

    get startSelected(): boolean {
        return this.start === 0;
    }

    get endSelected(): boolean {
        return this.end === this.length - 1;
    }

    public fromNode(node: Node): Topology {
        this.node = node;
        this.length = node.nodeType === Node.TEXT_NODE
            ? node.textContent!.length
            : node.childNodes.length;
        this.end = this.length - 1;
        return this;
    }

    public fromSelection(selection: SelectionDetails): Topology {
        const ancestorPath = getNodePath(selection.commonAncestor, selection.editableDiv);
        if (!ancestorPath) throw new Error('No se encontró el ancestro común');

        this.fromNode(selection.commonAncestor).setPath(ancestorPath);
        const startFound: { value: boolean } = { value: false };
        if (this.node!.nodeType === Node.TEXT_NODE) this.scanTextNode(selection);
        else this.scanElementNode(selection, startFound);
        return this;
    }

    public setStart(start: number): Topology {
        this.start = start;
        return this;
    }

    public setEnd(end: number): Topology {
        this.end = end;
        return this;
    }

    public setPath(path: number[]): Topology {
        this.path = path;
        return this;
    }

    public setParent(parent: Topology): Topology {
        this.parent = parent;
        return this;
    }

    public scanTextNode(selection: SelectionDetails): void {
        if (selection.startNode.node === this.node || selection.endNode.node === this.node) {
            const selectedNode = selection.startNode.node === this.node
                ? selection.startNode
                : selection.endNode;
            this.setStart(selectedNode.start).setEnd(selectedNode.end);
        }
    }

    public scanElementNode(selection: SelectionDetails, startFound: { value: boolean }): void {
        const children = Array.from(this.node!.childNodes);
        const startNode: Node = selection.startNode.node;
        const endNode: Node = selection.endNode.node;

        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            if (!startFound && node !== startNode && !node.contains(startNode)) continue;
            if (!startFound) this.setStart(i);

            const topology = new Topology()
                .fromNode(node)
                .setPath([...this.path, i])
                .setParent(this);

            node.nodeType === Node.TEXT_NODE
                ? topology.scanTextNode(selection)
                : topology.scanElementNode(selection, startFound);

            if (node === startNode) {
                startFound.value = true;
                topology.start = i;
            }

            this.children.push(topology);
            if (node === endNode || node.contains(endNode)) {
                this.setEnd(i);
                break;
            }
        }
    }
}