import { HistoryAction } from '../types/history-action.type.ts';
import { EditorInitializer } from './editor-Initializer.ts';

export class ActionsHistory {
    private actions: HistoryAction[] = [];
    private savedText: string = '';
    private savedStyle: string | null = null;

    // Variables para el manejo del historial de escritura
    private writingSelection: Range | null = null;
    private writingContent: string = '';

    constructor(private readonly depreditor: EditorInitializer) {}

    public setUndoListener() {

        // TODO: Guardar la selección al hacer focus
        this.depreditor.editableDiv.addEventListener('keydown', (e) => {
            const keyboardEvent = e as KeyboardEvent;
            if (keyboardEvent.code.startsWith('Arrow')) {
                this.initWritingEvent();
                return;
            }
            this.processWriting(keyboardEvent);
        });

        document.addEventListener('keydown', (e) => {
            const keyboardEvent = e as KeyboardEvent;

            // Prevención del comportamiento nativo de Ctrl+Z
            if (keyboardEvent.code === 'KeyZ' && keyboardEvent.ctrlKey) {
                if (this.depreditor.selectionOnEditableDiv()) {
                    e.preventDefault();
                    this.undo();
                } else if (e.target === document.body) {
                    e.preventDefault();
                }
            }
        });

        this.depreditor.editableDiv.addEventListener('mouseup', () => {
            this.initWritingEvent();
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

        if (this.writingContent !== '') {
            this.initWritingEvent();
        }

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

    private initWritingEvent() {
        if (this.writingSelection && this.writingContent !== '') {
            this.saveWritingEvent();
        }
        const range = this.getCurrentRange();
        this.writingContent = '';
        this.writingSelection = range;
    }

    private processWriting(keyboardEvent: KeyboardEvent) {
        if (
            keyboardEvent.key.length === 1
            && !keyboardEvent.ctrlKey
            && !keyboardEvent.metaKey
            && !keyboardEvent.altKey
        ) {
            this.writingContent += keyboardEvent.key;
        }
    }

    private saveWritingEvent() {
        const range = this.writingSelection!;
        range.setEnd(
            range.startContainer,
            range.startOffset + this.writingContent.length,
        );
        this.actions.push({
            range,
            previousData: '',
            styling: null,
        });
    }

    private getCurrentRange(): Range {
        const selection = this.depreditor.selectionOnEditableDiv();
        return selection!.getRangeAt(0).cloneRange();
    }

}