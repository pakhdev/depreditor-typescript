import AffectedNodes from '../interfaces/affected-nodes.interface.ts';
import AffectedNodesPart from '../enums/affected-nodes-part.enum.ts';
import CollectingRange from '../interfaces/collecting-range.interface.ts';
import CollectingState from '../interfaces/collecting-state.interface.ts';
import StoredSelection from './stored-selection.ts';

class AffectedNodesFetcher {

    public static get(storedSelection: StoredSelection, part: AffectedNodesPart): AffectedNodes[] {
        const {
            startElement: { node: startNode },
            endElement: { node: endNode },
            commonAncestor,
            startIndexInCommonAncestor: startIndex,
            endIndexInCommonAncestor: endIndex,
        } = storedSelection;

        if (commonAncestor.node.nodeType === Node.TEXT_NODE)
            return [{ node: commonAncestor.node, children: [] }];

        if (startIndex === endIndex)
            return [];

        const nodes = Array.from(commonAncestor.node.childNodes).splice(startIndex, endIndex - startIndex);
        switch (part) {
            case AffectedNodesPart.BEFORE:
                return this.collect({ nodes, end: startNode, excludeEnd: true });
            case AffectedNodesPart.WITHIN:
                return this.collect({ nodes, start: startNode, end: endNode });
            case AffectedNodesPart.AFTER:
                return this.collect({ nodes, start: endNode, excludeStart: true });
        }
    }

    private static collect(range: CollectingRange, state?: CollectingState): AffectedNodes[] {
        const affectedNodes: AffectedNodes[] = [];
        if (!state) state = { startReached: !range.start };

        for (const node of range.nodes) {
            if (node === range.start)
                state.startReached = true;

            if (range.excludeEnd && node === range.end)
                return affectedNodes;

            if (range.excludeStart && node === range.start)
                return affectedNodes;

            if (state.startReached || (range.start && node.contains(range.start)))
                affectedNodes.push({
                    node,
                    children: this.collect({
                        nodes: Array.from(node.childNodes),
                        start: range.start,
                        end: range.end,
                    }, state),
                });

            if (range.end && (node === range.end || node.contains(range.end)))
                break;
        }

        return affectedNodes;
    }
}

export default AffectedNodesFetcher;