import { ButtonsState, FormattingName, ToolbarButton } from '../types';
import { EditorInitializer } from './editor-Initializer.ts';

export class ToolbarHandler {

    private readonly editableDiv!: HTMLDivElement;
    private readonly handleMouseUp = () => setTimeout(() => this.handleButtonsState(), 0);
    private readonly handleKeyUp = () => this.handleButtonsState();
    private readonly handleToolbarMouseUp = () => this.handleButtonsState();
    private readonly handleEditableDivMouseDown = () => this.clickOnEditableDiv = true;
    private readonly handleDocumentMouseUp = () => setTimeout(() => {
        if (this.clickOnEditableDiv) this.handleButtonsState();
    }, 0);
    private clickOnEditableDiv = false;

    constructor(
        private readonly toolbarContainer: HTMLElement,
        private readonly depreditor: EditorInitializer,
    ) {
        this.editableDiv = this.depreditor.editableDiv;
        this.createButtons();
        this.editableDiv.addEventListener('mouseup', this.handleMouseUp);
        this.editableDiv.addEventListener('keyup', this.handleKeyUp);
        this.toolbarContainer.addEventListener('mouseup', this.handleToolbarMouseUp);
        this.editableDiv.addEventListener('mousedown', this.handleEditableDivMouseDown);
        document.addEventListener('mouseup', this.handleDocumentMouseUp);
    }

    private readonly buttons: ToolbarButton[] = [
        {
            icon: 'icon-set-bold', action: () => this.depreditor.formatter.apply(
                { name: 'bold', icon: 'icon-set-bold', tag: 'strong', isBlock: false },
            ),
        },
        { icon: 'icon-set-italic', action: () => this.depreditor.formatter.format('italic') },
        { icon: 'icon-set-underline', action: () => this.depreditor.formatter.format('underline') },
        {
            icon: 'icon-set-code', action: () => this.depreditor.formatter.apply({
                name: 'code',
                icon: 'icon-set-code',
                tag: 'div',
                isBlock: true,
                classes: ['code-text'],
            }),
        },
        { icon: 'icon-set-list-numbered', action: () => this.depreditor.formatter.insertList('numbered') },
        { icon: 'icon-set-list-dots', action: () => this.depreditor.formatter.insertList('dotted') },
        {
            icon: 'icon-set-paragraph-left', action: () => this.depreditor.formatter.apply({
                name: 'paragraph-left',
                icon: 'icon-set-paragraph-left',
                tag: 'div',
                isBlock: true,
                styles: { textAlign: 'left' },
                groups: ['alignments'],
            }),
        },
        {
            icon: 'icon-set-paragraph-center', action: () => this.depreditor.formatter.apply({
                name: 'paragraph-center',
                icon: 'icon-set-paragraph-center',
                tag: 'div',
                isBlock: true,
                styles: { textAlign: 'center' },
                groups: ['alignments'],
            }),
        },
        {
            icon: 'icon-set-paragraph-right', action: () => this.depreditor.formatter.apply({
                name: 'paragraph-right',
                icon: 'icon-set-paragraph-right',
                tag: 'div',
                isBlock: true,
                styles: { textAlign: 'right' },
                groups: ['alignments'],
            }),
        },
        { icon: 'icon-insert-table', action: () => this.depreditor.popup.showTableForm() },
        {
            icon: 'icon-set-hidden', action: () => this.depreditor.formatter.apply({
                name: 'hidden',
                icon: 'icon-set-hidden',
                tag: 'span',
                isBlock: false,
                classes: ['hidden-text'],
            }),
        },
        { icon: 'icon-insert-link', action: () => this.depreditor.popup.showLinkForm() },
        { icon: 'icon-insert-image', action: () => this.depreditor.popup.showImageForm() },
        { icon: 'icon-set-text-color', action: () => this.depreditor.popup.showColorsForm('text') },
        { icon: 'icon-set-text-background-color', action: () => this.depreditor.popup.showColorsForm('background') },
    ];

    private buttonsState: ButtonsState = {
        bold: false,
        italic: false,
        underline: false,
        insertorderedlist: false,
        insertunorderedlist: false,
        justifyleft: false,
        justifycenter: false,
        justifyright: false,
        hidetext: false,
    };

    public handleButtonsState(): void {
        this.clickOnEditableDiv = false;
        console.log(this.depreditor.caret.getStylesAtCaret());
        const formattingNames: FormattingName[] = ['bold', 'italic', 'underline', 'insertorderedlist', 'insertunorderedlist', 'justifyleft', 'justifycenter', 'justifyright'];
        for (const formattingName of formattingNames) {
            this.setButtonState(formattingName, document.queryCommandState(formattingName));
        }
        this.setButtonState('hidetext', this.depreditor.caret.isSelectionInsideHiddenText());
    }

    public destroyListeners(): void {
        this.editableDiv.removeEventListener('mouseup', this.handleMouseUp);
        this.editableDiv.removeEventListener('keyup', this.handleKeyUp);
        this.toolbarContainer.removeEventListener('mouseup', this.handleToolbarMouseUp);
        this.editableDiv.removeEventListener('mousedown', this.handleEditableDivMouseDown);
        document.removeEventListener('mouseup', this.handleDocumentMouseUp);
    }

    private createButtons(): void {
        this.buttons.forEach(button => {
            const newButton = document.createElement('button');
            newButton.classList.add('editor-toolbar__icon');
            newButton.classList.add(button.icon);
            newButton.onmousedown = button.action;
            this.toolbarContainer.appendChild(newButton);
        });
    }

    private setButtonState(formattingName: FormattingName, newState: boolean): void {
        if (this.buttonsState[formattingName] === newState) return;

        let button: HTMLElement | null = null;
        const activeClassname: string = 'editor-toolbar__icon--active';

        switch (formattingName) {
            case 'bold':
                button = this.toolbarContainer.querySelector('.icon-set-bold')!;
                break;
            case 'italic':
                button = this.toolbarContainer.querySelector('.icon-set-italic')!;
                break;
            case 'underline':
                button = this.toolbarContainer.querySelector('.icon-set-underline')!;
                break;
            case 'insertorderedlist':
                button = this.toolbarContainer.querySelector('.icon-set-list-numbered')!;
                break;
            case 'insertunorderedlist':
                button = this.toolbarContainer.querySelector('.icon-set-list-dots')!;
                break;
            case 'justifyleft':
                button = this.toolbarContainer.querySelector('.icon-set-paragraph-left')!;
                break;
            case 'justifycenter':
                button = this.toolbarContainer.querySelector('.icon-set-paragraph-center')!;
                break;
            case 'justifyright':
                button = this.toolbarContainer.querySelector('.icon-set-paragraph-right')!;
                break;
            case 'hidetext':
                button = this.toolbarContainer.querySelector('.icon-set-hidden')!;
                break;
        }

        if (!button) return;

        this.buttonsState[formattingName] = newState;
        newState ? button.classList.add(activeClassname) : button.classList.remove(activeClassname);
    }

}