import { EditorInitializer } from './editor-Initializer.ts';

export class InsertingHandler {

    private readonly editableDiv!: HTMLDivElement;
    private readonly pasteHandler = (e: Event) => this.pasteText(e);
    private readonly dragStartHandler = () => this.isDragging = true;
    private readonly mouseUpHandler = () => this.isDragging = false;
    private readonly dropHandler = (e: DragEvent) => this.dropText(e);
    private isDragging = false;

    constructor(private readonly depreditor: EditorInitializer) {
        this.editableDiv = depreditor.editableDiv;
        this.editableDiv.addEventListener('paste', this.pasteHandler);
        this.editableDiv.addEventListener('dragstart', this.dragStartHandler);
        this.editableDiv.addEventListener('mouseup', this.mouseUpHandler);
        this.editableDiv.addEventListener('drop', this.dropHandler);
    }

    public destroyListeners(): void {
        this.editableDiv.removeEventListener('paste', this.pasteHandler);
        this.editableDiv.removeEventListener('dragstart', this.dragStartHandler);
        this.editableDiv.removeEventListener('mouseup', this.mouseUpHandler);
        this.editableDiv.removeEventListener('drop', this.dropHandler);
    }

    public dropText(event: DragEvent) {
        event.preventDefault();
        event.dataTransfer!.getData('text/html');
        const range = document.caretRangeFromPoint(event.clientX, event.clientY);
        if (!range) return;
        const targetNode = range.startContainer;
        const targetOffset = range.startOffset;
        this.depreditor.caret.setCaretAtPosition(targetNode, targetOffset);

        let text = event.dataTransfer!.getData('text/plain');
        if (!this.isDragging) {
            text = this.sanitizeText(text);
        } else {
            // TODO: Eliminar el texto movido y añadir al historial
        }
        this.depreditor.formatter.insertHtml(text);
    }

    private pasteText(e: Event) {
        e.preventDefault();
        let text = (e as ClipboardEvent).clipboardData!.getData('text');
        text = this.sanitizeText(text);
        this.depreditor.formatter.insertHtml(text);
    }

    private sanitizeText(text: string): string {
        text = text.replace(/&/g, '&amp;');
        text = text.replace(/</g, '&lt;');
        text = text.replace(/>/g, '&gt;');
        text = text.replace('\t', '  ');
        text = this.depreditor.caret.isSelectionInsideCodeText()
            ? this.setIndentationInCode(text)
            : this.setIndentationInText(text);
        text = text.replace(/\n/g, '<br>');
        return text;
    }

    private setIndentationInCode(text: string): string {
        let minIndentation = 0;
        const noIndentation = text
            .split('\n')
            .some(line => !line.startsWith(' ') && line.trim().length > 0);
        if (!noIndentation) {
            let matches = text.match(/^( +)/gm);
            minIndentation = Math.min(...matches!.map(match => match.length));
        }
        return text.split('\n')
            .map(line => line.replace(/^( +)/gm, (_, p1) => '&nbsp;'.repeat(p1.length - minIndentation)))
            .join('\n');
    };

    private setIndentationInText(text: string): string {
        return text.split('\n')
            .map(line => line.replace(/^( +)/gm, ''))
            .join('\n');
    };

}