import { EditorInitializer } from './editor-Initializer.ts';
import { ActionsHistory } from './actions-history.ts';
import { ToolbarHandler } from './toolbar-handler.ts';
import { CaretTracking } from './caret-tracking.ts';
import { PopupHandler } from './popup-handler.ts';
import { ImagesProcessor } from './images-processor.ts';

export class FormattingUtils {

    private readonly caret!: () => CaretTracking;
    private readonly history!: () => ActionsHistory;
    private readonly imagesProcessor!: () => ImagesProcessor;
    private readonly popup!: () => PopupHandler;
    private readonly toolbar!: () => ToolbarHandler;

    constructor(private readonly depreditor: EditorInitializer) {
        this.caret = () => this.depreditor.caret;
        this.history = () => this.depreditor.history;
        this.imagesProcessor = () => this.depreditor.imagesProcessor;
        this.popup = () => this.depreditor.popup;
        this.toolbar = () => this.depreditor.toolbar;
    }

    public format(style: string, avoidHistory?: boolean): void {
        document.execCommand(style, false);
        if (avoidHistory) return;
        this.history().saveState(style);
        this.history().saveRange();
        this.toolbar().handleButtonsState();
    }

    public insertCode(): void {
        this.caret().saveRange();
        const codeDiv = document.createElement('div');
        codeDiv.className = 'code-text';

        const selectedHtmlString = this.getSelectedHtml();
        if (selectedHtmlString) codeDiv.innerHTML = selectedHtmlString;

        this.insertElement(codeDiv);
        const brElement = document.createElement('br');
        codeDiv.parentNode!.insertBefore(brElement, codeDiv.nextSibling);
    }

    public setHidden(): void {
        if (this.caret().isSelectionInsideHiddenText()) {
            this.unsetHidden();
            return;
        }
        this.caret().saveRange();
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
        this.caret().moveCaretToEndOfSelection();
    }

    public align(direction: string): void {
        document.execCommand('justify' + direction);
        this.toolbar().handleButtonsState();
    }

    public insertList(type: string): void {
        document.execCommand(type === 'numbered'
            ? 'insertOrderedList'
            : 'insertUnorderedList',
        );
        this.toolbar().handleButtonsState();
    }

    public insertElement(element: HTMLElement): void {
        this.popup().hidePopup();
        this.caret().restoreRange();
        const selection = window.getSelection();
        this.history().saveState();

        if (selection) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(element);
        }

        this.history().saveRange();
        this.caret().moveCaretToEndOfSelection();
    }

    public insertHtml(html: string): void {
        const selection = window.getSelection();
        this.history().saveState();

        if (selection) {
            const range = selection.getRangeAt(0);
            const fragment = range.createContextualFragment(html);
            range.deleteContents();
            range.insertNode(fragment);
        }

        this.history().saveRange();
        this.caret().moveCaretToEndOfSelection();
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
        this.caret().moveCaretToEndOfSelection();
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
        this.popup().hidePopup();
        this.caret().restoreRange();
        type === 'text'
            ? document.execCommand('foreColor', false, color)
            : document.execCommand('hiliteColor', false, color);
        this.caret().moveCaretToEndOfSelection();
    }

    public async insertImage(fileInput: HTMLInputElement, doLargeImage: boolean): Promise<void> {
        const processedImages = await this.imagesProcessor().processImage(fileInput, doLargeImage);
        this.popup().hidePopup();
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