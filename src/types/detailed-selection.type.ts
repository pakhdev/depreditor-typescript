export type DetailedSelection = {
    isRange: boolean;
    sameNode: boolean;
    commonAncestor: Node;
    startNode: {
        node: Node,
        fullySelected: boolean,
        startSelected: boolean,
        endSelected: boolean,
        start: number,
        end: number,
        length: number,
    };
    endNode: {
        node: Node,
        fullySelected: boolean,
        startSelected: boolean,
        endSelected: boolean,
        start: number,
        end: number,
        length: number,
    };
    range: Range | null;
}