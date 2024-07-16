import AffectedNodes from '../interfaces/affected-nodes.interface.ts';
import CollectingRange from '../interfaces/collecting-range.interface.ts';
import CollectingState from '../interfaces/collecting-state.interface.ts';
import StoredSelection from './stored-selection.ts';

class AffectedNodesFetcher {

    public static get(storedSelection: StoredSelection, part: 'before' | 'within' | 'after'): AffectedNodes[] {
        const {
            startElement,
            endElement,
            commonAncestor,
            startIndexInCommonAncestor: startIndex,
            endIndexInCommonAncestor: endIndex,
        } = storedSelection;

        if (commonAncestor.node.nodeType === Node.TEXT_NODE)
            return [{ node: commonAncestor.node, children: [] }];

        let startContainer = commonAncestor.node.childNodes[startIndex];
        if (part === 'after')
            startContainer = commonAncestor.node.childNodes[endIndex];

        let endContainer: Node | undefined = undefined;
        if (part === 'after')
            endContainer = commonAncestor.node.childNodes[endIndex];

        let startNode: Node | undefined = undefined;
        if (part === 'within')
            startNode = startElement.node;
        if (part === 'after')
            startNode = endElement.node;

        let endNode: Node | undefined = undefined;
        if (part === 'before')
            endNode = startElement.node;
        if (part === 'within')
            endNode = endElement.node;

        return this.collect({
            collectFrom: commonAncestor.node,
            startContainer,
            endContainer,
            startNode,
            endNode,
        });
    }

    private static collect(range: CollectingRange, state?: CollectingState): AffectedNodes[] {
        const affectedNodes: AffectedNodes[] = [];
        if (!state) {
            state = {
                startContainerReached: !range.startContainer,
                startPointReached: !range.startNode,
            };
        }

        const { collectFrom, startContainer, endContainer, startNode, endNode } = range;
        const children = Array.from(collectFrom.childNodes);

        for (const child of children) {
            if (child === startContainer)
                state.startContainerReached = true;

            if (!state.startContainerReached)
                continue;

            if (child === startNode)
                state.startPointReached = true;

            if (state.startPointReached || (!state.startPointReached && child.contains(startNode!)))
                affectedNodes.push({
                    node: child,
                    children: this.collect({
                        ...range,
                        collectFrom: child,
                        startContainer: undefined,
                        endContainer: undefined,
                    }, state),
                });

            if (endNode && (child === endNode || child.contains(endNode)))
                break;

            if (endContainer && child === endContainer)
                break;
        }

        return affectedNodes;
    }
}

export default AffectedNodesFetcher;