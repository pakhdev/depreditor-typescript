import { EditorInitializer } from './editor-Initializer.ts';

export class FormattingUtils {

    constructor(private readonly depreditor: EditorInitializer) {}

    public format(style: string): void {
        document.execCommand(style, false);
        this.depreditor.toolbar.handleButtonsState();
    }

    public insertCode(): void {
        document.execCommand('insertHTML', false, '<div class="code-text">' + document.getSelection() + '<br>&ZeroWidthSpace;</div><br>');
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
        this.depreditor.restoreSelection();
        const selection = window.getSelection();

        if (selection) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(element);
        }
        this.depreditor.moveCaretToEndOfSelection();
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
        this.depreditor.moveCaretToEndOfSelection();
    }

    public setColor(type: 'text' | 'background', color: string) {
        this.depreditor.popup.hidePopup();
        this.depreditor.restoreSelection();
        type === 'text'
            ? document.execCommand('foreColor', false, color)
            : document.execCommand('hiliteColor', false, color);
        this.depreditor.moveCaretToEndOfSelection();
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
}