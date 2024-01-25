import { EditorInitializer } from './editor-Initializer.ts';

export class SafeDeletion {

    private readonly editableDiv!: HTMLDivElement;
    private readonly deletionKeysListenerHandler = (e: Event) => this.deletionKeysListener(e);

    constructor(private readonly depreditor: EditorInitializer) {
        this.editableDiv = this.depreditor.editableDiv;
        this.editableDiv.addEventListener('keydown', this.deletionKeysListenerHandler);
    }

    public destroyListeners(): void {
        this.editableDiv.removeEventListener('keydown', this.deletionKeysListenerHandler);
    }

    private deletionKeysListener(e: Event): void {
        if ((e as KeyboardEvent).key === 'Delete') {
            if (this.preventDelete()) {
                e.preventDefault();
            }
        }
        if ((e as KeyboardEvent).key === 'Backspace') {
            if (this.preventBackspace()) {
                e.preventDefault();
            }
        }
    };

    private preventDelete(): boolean {
        const selection = window.getSelection();
        if (!selection || !selection.focusNode) return false;

        const focusNode = selection.focusNode;
        if (this.depreditor.caret.isNextSiblingCodeText(focusNode)) {
            const textNode = selection.focusNode as Text;
            const textLength = textNode.textContent?.trim().length || 0;
            const offset = selection.focusOffset;
            if (offset >= textLength) {
                return true;
            }
        }

        if (focusNode.nodeType === Node.ELEMENT_NODE) {
            const focusNodeElement = focusNode as Element;
            if (focusNodeElement.classList.contains('code-text')) {
                return true;
            }
        }

        if (focusNode.nodeType === Node.TEXT_NODE) {
            const textNode = focusNode as Text;
            const textLength = textNode.textContent?.trim().length || 0;
            const offset = selection.focusOffset;
            if (offset >= textLength) {
                const focusNodeParent = focusNode.parentNode as Element;
                if (focusNodeParent.classList.contains('code-text')) {
                    return true;
                }
            }
        }
        return false;
    }

    private preventBackspace(): boolean {
        // Casos para prevenir el comportamiento por defecto:
        // EL OFFSET ES CERO
        // 1. El nodo de foco es un elemento div, y tiene contenido
        // 2. El nodo de foco es un elemento div, y tiene elementos hijos?
        // 3. El nodo de foco es un texto, y el nodo anterior(o el padre) es un tag y no es un BR, ni span, ni font
        // 4. El nodo de foco es un li, y no es el primer li
        return false;
    }
}