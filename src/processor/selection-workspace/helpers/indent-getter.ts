import StoredSelection from '../../../core/selection/helpers/stored-selection.ts';

class IndentGetter {
    public static get(selection: StoredSelection): number {
        let indent = 0;
        const { startElement } = selection;
        if (startElement.node.nodeType === Node.TEXT_NODE) {
            const spaces = startElement.node.textContent?.match(/^ */);
            if (spaces)
                indent = spaces[0].length;
        }
        return indent;
    }
}

export default IndentGetter;