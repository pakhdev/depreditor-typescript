import { HistoryAction } from '../types/history-action.type.ts';

export class ActionsHistory {
    private actions: HistoryAction[] = [];
    private savedText: string = '';

    public saveText() {
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
        });
    }

    public undo() {
        if (this.actions.length === 0) return;
        const action = this.actions.pop()!;
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(action.range);
        const range = selection!.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(action.previousData));
        return true;
    }
}