import { EditorInitializer } from './editor-Initializer.ts';
import { FormattingName } from '../types';

export class NodeInspector {

    constructor(private readonly depreditor: EditorInitializer) {

    }

    getCurrent() {
        const currentSelection = this.depreditor.caret.getSelection();
        if (!currentSelection) return null;
        return currentSelection.focusNode;
    }

    getAlignment(): string | null {
        const alignmentNames: FormattingName[] = ['justifyleft', 'justifycenter', 'justifyright'];
        for (const alignmentName of alignmentNames) {
            if (document.queryCommandState(alignmentName)) return alignmentName;
        }
        return null;
    }

    getForeColor(): string | null {
        return document.queryCommandValue('foreColor');
    }

    getBackgroundColor(): string | null {
        return document.queryCommandValue('backColor');
    }

    isEmpty(node: Node): boolean {
        const childElements = node.childNodes;
        if (childElements.length === 0) return true;
        return childElements.length === 1 && node.firstChild?.nodeName.toLowerCase() === 'br';
    }
}