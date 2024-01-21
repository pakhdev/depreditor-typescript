import { HistoryAction } from '../types/history-action.type.ts';
import { EditorInitializer } from './editor-Initializer.ts';

export class ActionsHistory {
    private actions: HistoryAction[] = [];
    private savedText: string = '';
    private savedStyle: string | null = null;

    constructor(private readonly depreditor: EditorInitializer) {}

    public setUndoListener() {
        document.addEventListener('keydown', (e) => {
            const keyboardEvent = e as KeyboardEvent;
            if (keyboardEvent.code === 'KeyZ' && keyboardEvent.ctrlKey) {
                if (this.depreditor.isSelectionOnEditableDiv()) {
                    e.preventDefault();
                    this.undo();
                } else if (e.target === document.body) {
                    e.preventDefault();
                }
            }
        });
    }

    public removeUndoListener() {}

    public saveState(style?: string) {
        this.savedStyle = style || null;
        this.savedText = window.getSelection()?.getRangeAt(0)
            .cloneRange()
            .cloneContents()
            .textContent || '';
    }

    public saveRange() {
        const selection = window.getSelection();
        if (!selection || !selection.focusNode) return;
        this.actions.push({
            range: selection.getRangeAt(0).cloneRange(),
            previousData: this.savedText || '',
            styling: this.savedStyle,
        });
    }

    public undo() {
        if (this.actions.length === 0) return;
        const action = this.actions.pop()!;
        if (action.styling) {
            this.restoreStyle(action);
        } else {
            this.restoreContent(action);
        }
        return true;
    }

    private restoreContent(action: HistoryAction) {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(action.range);
        const range = selection!.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(action.previousData));
    }

    private restoreStyle(action: HistoryAction) {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(action.range);
        this.depreditor.formatter.format(action.styling!, true);
    }
}