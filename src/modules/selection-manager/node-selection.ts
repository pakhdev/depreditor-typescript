export class NodeSelection {

    public start: number = 0;
    public end: number;
    public length: number;

    constructor(public readonly node: Node) {
        this.node = node;
        this.length = node.nodeType === Node.TEXT_NODE ? (node as Text).length : 0;
        this.end = this.length ? this.length - 1 : 0;
    }

    public get fullySelected(): boolean {
        return this.startSelected && this.endSelected;
    }

    public get startSelected(): boolean {
        return this.start === 0;
    }

    public get endSelected(): boolean {
        return !this.length || this.end === this.length - 1;
    }

    public setStart(start: number): NodeSelection {
        this.start = start;
        return this;
    }

    public setEnd(end: number): NodeSelection {
        this.end = end;
        return this;
    }

}