import { EditorInitializer } from './editor-Initializer.ts';

export class FormattingUtils {

    constructor(private readonly depreditor: EditorInitializer) {}

    public format(style: string, avoidHistory?: boolean): void {
        if (!this.depreditor.caret.getSelection()) return;
        document.execCommand(style, false);
        if (avoidHistory) return;
        this.depreditor.history.saveState(style);
        this.depreditor.history.saveRange();
        this.depreditor.toolbar.handleButtonsState();
    }

    public insertCode(): void {
        this.depreditor.caret.saveRange();
        const codeDiv = document.createElement('div');
        codeDiv.className = 'code-text';

        const selectedHtmlString = this.getSelectedHtml();
        if (selectedHtmlString) codeDiv.innerHTML = selectedHtmlString;

        this.insertElement(codeDiv);
        const brElement = document.createElement('br');
        codeDiv.parentNode!.insertBefore(brElement, codeDiv.nextSibling);
    }

    public setHidden(): void {
        if (this.depreditor.caret.isSelectionInsideHiddenText()) {
            this.unsetHidden();
            return;
        }
        this.depreditor.caret.saveRange();
        const selectedHtmlString = this.getSelectedHtml();
        if (!selectedHtmlString || !selectedHtmlString!.replace(/<[^>]*>/g, '').trim().length) return;

        const codeDiv = document.createElement('div');
        codeDiv.className = 'hidden-text';
        codeDiv.innerHTML = selectedHtmlString;
        this.insertElement(codeDiv);
    }

    public unsetHidden(): void {
        const selection = window.getSelection()!;
        const range = selection.getRangeAt(0);
        const commonAncestor = range.commonAncestorContainer as HTMLElement;

        const hiddenElement = commonAncestor.parentNode as HTMLDivElement;
        range.selectNode(hiddenElement);
        selection.removeAllRanges();
        selection.addRange(range);

        const textElement = document.createTextNode(selection.toString());
        range.deleteContents();
        range.insertNode(textElement);
        this.depreditor.caret.moveCaretToEndOfSelection();
    }

    public align(direction: string): void {
        document.execCommand('justify' + direction);
        this.depreditor.toolbar.handleButtonsState();
    }

    public insertList(type: string): void {
        document.execCommand(type === 'numbered'
            ? 'insertOrderedList'
            : 'insertUnorderedList',
        );
        this.depreditor.toolbar.handleButtonsState();
    }

    public insertElement(element: HTMLElement): void {
        this.depreditor.popup.hidePopup();
        this.depreditor.caret.restoreRange();
        const selection = window.getSelection();
        this.depreditor.history.saveState();

        if (selection) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(element);
        }

        this.depreditor.history.saveRange();
        this.depreditor.caret.moveCaretToEndOfSelection();
    }

    public insertHtml(html: string): void {
        const selection = window.getSelection();
        this.depreditor.history.saveState();

        if (selection) {
            const range = selection.getRangeAt(0);
            const fragment = range.createContextualFragment(html);
            range.deleteContents();
            range.insertNode(fragment);
        }

        this.depreditor.history.saveRange();
        this.depreditor.caret.moveCaretToEndOfSelection();
    }

    public insertTable(rows: number, cols: number): void {
        if (rows && cols) {
            const table = document.createElement('table');
            const tbody = document.createElement('tbody');

            for (let i = 0; i < rows; i++) {
                const row = document.createElement('tr');
                for (let j = 0; j < cols; j++) {
                    const cell = document.createElement('td');
                    cell.innerHTML = '&ZeroWidthSpace;';
                    row.appendChild(cell);
                }
                tbody.appendChild(row);
            }

            table.appendChild(tbody);

            this.insertElement(table);
        }
        this.depreditor.caret.moveCaretToEndOfSelection();
    }

    public insertLink(url: string, text: string): void {
        if (!url.length) return;

        const link = document.createElement('a');
        link.href = url;
        link.textContent = text;
        link.target = '_blank';
        this.insertElement(link);
    }

    public setColor(type: 'text' | 'background', color: string) {
        this.depreditor.popup.hidePopup();
        this.depreditor.caret.restoreRange();
        type === 'text'
            ? document.execCommand('foreColor', false, color)
            : document.execCommand('hiliteColor', false, color);
        this.depreditor.caret.moveCaretToEndOfSelection();
    }

    public async insertImage(fileInput: HTMLInputElement, doLargeImage: boolean): Promise<void> {
        const processedImages = await this.depreditor.imagesProcessor.processImage(fileInput, doLargeImage);
        this.depreditor.popup.hidePopup();
        if (!processedImages) return;
        const imgElement = document.createElement('img');
        if (processedImages.largeImage) imgElement.setAttribute('largeImage', processedImages.largeImage);
        imgElement.src = processedImages?.initialImage;
        this.insertElement(imgElement);
    }

    private getSelectedHtml(): string | undefined {
        const selection = document.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = document.createElement('div');
            container.appendChild(range.cloneContents());
            return container.innerHTML;
        }
        return;
    }
}