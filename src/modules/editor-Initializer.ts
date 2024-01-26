import { ToolbarHandler } from './toolbar-handler.ts';
import { PopupHandler } from './popup-handler.ts';
import { ImagesProcessor } from './images-processor.ts';
import { FormattingUtils } from './formatting-utils.ts';
import { ActionsHistory } from './actions-history.ts';
import { SafeDeletion } from './safe-deletion.ts';
import { CaretTracking } from './caret-tracking.ts';
import { InsertingHandler } from './inserting-handler.ts';
import { NodeInspector } from './node-inspector.ts';

export class EditorInitializer {

    private readonly caretTracking!: CaretTracking;
    private readonly toolbarHandler!: ToolbarHandler;
    private readonly popupHandler!: PopupHandler;
    private readonly formattingHandler!: FormattingUtils;
    private readonly imagesHandler!: ImagesProcessor;
    private readonly historyHandler!: ActionsHistory;
    private readonly insertingHandler!: InsertingHandler;
    private readonly safeDeletion: SafeDeletion;
    private readonly nodeInfo!: NodeInspector;

    private domChangeObserver!: MutationObserver;
    private enterEventListener!: EventListener;

    constructor(
        public readonly editableDiv: HTMLDivElement,
        toolbarContainer: HTMLElement,
    ) {
        this.normalizeCode();

        this.caretTracking = new CaretTracking(this);
        this.formattingHandler = new FormattingUtils(this);
        this.imagesHandler = new ImagesProcessor();
        this.popupHandler = new PopupHandler(this);
        this.toolbarHandler = new ToolbarHandler(toolbarContainer, this);
        this.historyHandler = new ActionsHistory(this);
        this.safeDeletion = new SafeDeletion(this);
        this.insertingHandler = new InsertingHandler(this);
        this.nodeInfo = new NodeInspector(this);

        this.initListeners(this.editableDiv);
    }

    public get popup(): PopupHandler {
        return this.popupHandler!;
    }

    public get toolbar(): ToolbarHandler {
        return this.toolbarHandler!;
    }

    public get formatter(): FormattingUtils {
        return this.formattingHandler!;
    }

    public get imagesProcessor(): ImagesProcessor {
        return this.imagesHandler!;
    }

    public get history(): ActionsHistory {
        return this.historyHandler!;
    }

    public get caret(): CaretTracking {
        return this.caretTracking!;
    }

    public get node(): NodeInspector {
        return this.nodeInfo!;
    }

    public selectionOnEditableDiv(): Selection | null { // TO DELETE
        const selection = window.getSelection();
        if (!selection || !selection.focusNode) return null;

        let checkingParentNode = selection.focusNode;
        while (checkingParentNode) {
            if (checkingParentNode === this.editableDiv) return selection;
            checkingParentNode = checkingParentNode.parentNode as Node;
        }
        return null;
    }

    private initListeners(editableDiv: HTMLElement): void {
        this.enterEventListener = (e: Event) => {
            if (
                (e as KeyboardEvent).key === 'Enter' &&
                !document.queryCommandState('insertorderedlist') &&
                !document.queryCommandState('insertunorderedlist')
            ) {
                e.preventDefault();
                this.insertLineBreak();
            }
        };
        this.history.setUndoListener();
        editableDiv.addEventListener('keydown', this.enterEventListener);
        this.startObservingDOM();
    }

    private destroyListeners(): void {
        if (!this.editableDiv) return;
        this.editableDiv.removeEventListener('keydown', this.enterEventListener);
        this.history.destroyListeners();
        this.toolbar.destroyListeners();
        this.caret.destroyListeners();
        this.safeDeletion.destroyListeners();
        this.insertingHandler.destroyListeners();
        this.stopObservingDOM();
    }

    private startObservingDOM(): void {
        this.domChangeObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.removedNodes) {
                    if (Array.from(mutation.removedNodes).includes(this.editableDiv)) {
                        this.destroyListeners();
                    }
                }
            }
        });

        if (this.editableDiv.parentNode) {
            this.domChangeObserver.observe(this.editableDiv.parentNode, { childList: true });
        }
    }

    private stopObservingDOM(): void {
        if (!this.domChangeObserver) return;
        this.domChangeObserver.disconnect();
    }

    private normalizeCode(): void {
        this.editableDiv.innerHTML = this.editableDiv.innerHTML
            .replace(/\n/g, '')
            .replace(/\s+/g, ' ');
    }

    private insertLineBreak() {
        const selection = window.getSelection();
        if (!selection || selection.focusNode === null) return;
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const fragment = range.createContextualFragment('<br>&ZeroWidthSpace;');
            range.insertNode(fragment);
            range.setStart(selection.focusNode, selection.focusOffset);
            range.collapse(true);
        }
    }

}