export const findNodeByPath = (path: number[], parent: Node): Node | null => {
    for (const idx of path) {
        if (!parent || parent.nodeType !== Node.ELEMENT_NODE) return null;
        parent = parent.childNodes[idx] ?? null;
    }
    return parent;
};

export const findNodeByIndex = (parent: Node, idx: number): Node | null => {
    return parent.childNodes.item(idx) ?? null;
};

export const getNodePath = (nodeToFind: Node, parent: Node): number[] | null => {
    if (nodeToFind === parent) return [];
    const innerNodes = parent.childNodes;
    for (let i = 0; i < innerNodes.length; i++) {
        if (innerNodes[i] === nodeToFind) return [i];
        if (innerNodes[i].nodeType === Node.ELEMENT_NODE && innerNodes[i].contains(nodeToFind)) {
            const childPath = getNodePath(nodeToFind, innerNodes[i]);
            return childPath !== null ? [i, ...childPath] : null;
        }
    }
    return null;
};