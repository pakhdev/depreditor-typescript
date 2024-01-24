import { ButtonsState, FormattingName, ToolbarButton } from '../types';
import { CaretTracking } from './caret-tracking.ts';
import { EditorInitializer } from './editor-Initializer.ts';
import { FormattingUtils } from './formatting-utils.ts';
import { PopupHandler } from './popup-handler.ts';

export class ToolbarHandler {

    private readonly editableDiv!: HTMLDivElement;
    private readonly caret!: CaretTracking;
    private readonly formatter!: FormattingUtils;
    private readonly popup!: PopupHandler;

    constructor(
        private readonly toolbarContainer: HTMLElement,
        private readonly depreditor: EditorInitializer,
    ) {
        this.editableDiv = this.depreditor.editableDiv;
        this.caret = this.depreditor.caret;
        this.formatter = this.depreditor.formatter;
        this.popup = this.depreditor.popup;

        this.createButtons();
        this.editableDiv.addEventListener('mouseup', () => this.handleButtonsState());
        this.editableDiv.addEventListener('keyup', () => this.handleButtonsState());
    }

    private readonly buttons: ToolbarButton[] = [
        { icon: 'icon-set-bold', action: () => this.formatter.format('bold') },
        { icon: 'icon-set-italic', action: () => this.formatter.format('italic') },
        { icon: 'icon-set-underline', action: () => this.formatter.format('underline') },
        { icon: 'icon-set-code', action: () => this.formatter.insertCode() },
        { icon: 'icon-set-list-numbered', action: () => this.formatter.insertList('numbered') },
        { icon: 'icon-set-list-dots', action: () => this.formatter.insertList('dotted') },
        { icon: 'icon-set-paragraph-left', action: () => this.formatter.align('left') },
        { icon: 'icon-set-paragraph-center', action: () => this.formatter.align('center') },
        { icon: 'icon-set-paragraph-right', action: () => this.formatter.align('right') },
        { icon: 'icon-insert-table', action: () => this.popup.showTableForm() },
        { icon: 'icon-set-hidden', action: () => this.formatter.setHidden() },
        { icon: 'icon-insert-link', action: () => this.popup.showLinkForm() },
        { icon: 'icon-insert-image', action: () => this.popup.showImageForm() },
        { icon: 'icon-set-text-color', action: () => this.popup.showColorsForm('text') },
        { icon: 'icon-set-text-background-color', action: () => this.popup.showColorsForm('background') },
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
        const formattingNames: FormattingName[] = ['bold', 'italic', 'underline', 'insertorderedlist', 'insertunorderedlist', 'justifyleft', 'justifycenter', 'justifyright'];
        for (const formattingName of formattingNames) {
            this.setButtonState(formattingName, document.queryCommandState(formattingName));
        }
        this.setButtonState('hidetext', this.caret.isSelectionInsideHiddenText());
    }

    public destroyListeners(): void {
        this.editableDiv.removeEventListener('mouseup', () => this.handleButtonsState());
        this.editableDiv.removeEventListener('keyup', () => this.handleButtonsState());
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