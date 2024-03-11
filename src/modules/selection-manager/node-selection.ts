import { ContainerProps } from '../../types/container-props.type.ts';

export class NodeSelection {

    public node: Node | null = null;
    public start: number = 0;
    public end: number = 0;
    public length: number = 0;
    public parentToPreserve: Node | null = null;

    constructor(node?: Node) {
        if (!node) return;
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

    public findParentToPreserve(formatting: ContainerProps, editableDiv: HTMLDivElement): void {
        if (!this.node) return;
        let parent: Node | null = this.node.parentNode;
        while (parent !== editableDiv && parent !== null) {
            // TODO: Implementar lógica para encontrar el nodo padre a preservar.
            if (!parent.parentNode) throw new Error('No se encontró el nodo padre');
            parent = parent.parentNode;
        }
    }

}