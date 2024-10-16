interface CollectingRange {
    nodes: Node[];
    start?: Node;
    end?: Node;
    excludeStart?: boolean;
    excludeEnd?: boolean;
}

export default CollectingRange;