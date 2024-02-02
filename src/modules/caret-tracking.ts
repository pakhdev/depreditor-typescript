import { EditorInitializer } from './editor-Initializer.ts';
import { FormattingName } from '../types';
import { toolsConfig } from '../tools.config.ts';

export class CaretTracking {

    private readonly editableDiv: HTMLDivElement;
    private readonly blurHandler = () => this.saveRange();
    private savedRange: Range | null = null;

    constructor(private readonly depreditor: EditorInitializer) {
        this.editableDiv = this.depreditor.editableDiv;
        this.editableDiv.addEventListener('blur', this.blurHandler);
    }

    public destroyListeners(): void {
        this.editableDiv.removeEventListener('blur', this.blurHandler);
    }

    public getSelection(): Selection | null {
        const selection = window.getSelection();
        if (!selection || !selection.focusNode) return null;

        let checkingParentNode = selection.focusNode;
        while (checkingParentNode) {
            if (checkingParentNode === this.editableDiv) return selection;
            checkingParentNode = checkingParentNode.parentNode as Node;
        }
        return null;
    }

    public moveCaretToEndOfSelection(): void {
        const selection = this.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.collapse(false);
        }
    }

    public setCaretAtPosition(node: Node, offset: number): void {
        const currentSelection = this.getSelection();
        if (!currentSelection) this.editableDiv.focus();

        const range = document.createRange();
        range.setStart(node, offset);
        range.collapse(true);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);

    }

    public saveRange(): void {
        const currentSelection = this.getSelection();

        const range = currentSelection?.getRangeAt(0);
        console.log('saveRange', range!.startOffset, range!.endOffset);

        if (!currentSelection) return;
        this.savedRange = currentSelection.rangeCount > 0
            ? currentSelection.getRangeAt(0).cloneRange()
            : null;
    }

    public restoreRange(): void {
        if (this.savedRange) {
            const selection = this.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(this.savedRange);
        } else {
            this.editableDiv.focus();
        }
    }

    public isNextSiblingCodeText(focusNode: Node): boolean {
        let siblingDistance = 2;
        let nextSibling = focusNode.nextSibling;
        while (nextSibling) {
            if (siblingDistance === 0) return false;
            if (nextSibling.nodeType === Node.ELEMENT_NODE) {
                const element = nextSibling as Element;
                if (element.classList.contains('code-text')) {
                    return true;
                } else {
                    siblingDistance--;
                }
            } else if (nextSibling.nodeType === Node.TEXT_NODE) {
                const textNode = nextSibling as Text;
                if (textNode.textContent?.replace(/\s/g, '') !== '') {
                    siblingDistance--;
                }
            }
            nextSibling = nextSibling.nextSibling;
        }
        return false;
    }

    public isSelectionInsideCodeText(): boolean {
        const selection = this.getSelection();
        if (!selection) return false;

        let checkingParentNode = selection.focusNode;
        while (checkingParentNode) {
            if (checkingParentNode.nodeType === Node.ELEMENT_NODE) {
                const element = checkingParentNode as Element;
                if (element.classList.contains('code-text')) return true;
            }
            checkingParentNode = checkingParentNode.parentNode as Node;
        }
        return false;
    }

    public isSelectionInsideHiddenText(): boolean {
        const selection = this.getSelection();
        if (!selection) return false;

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const commonAncestor = range.commonAncestorContainer as HTMLElement;

            if (
                commonAncestor.parentNode &&
                commonAncestor.nodeType === Node.TEXT_NODE &&
                commonAncestor.parentNode instanceof Element
            ) {
                return commonAncestor.parentNode.classList.contains('hidden-text');
            }
        }
        return false;
    }

    public isTextNodeFullySelected(): boolean {
        const selection = this.getSelection();
        if (!selection) return false;

        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;
        if (startContainer === endContainer) {
            if (startContainer.nodeType === Node.TEXT_NODE) {
                const textNode = startContainer as Text;
                if (range.startOffset === 0 && range.endOffset === textNode.length) return true;
                if (range.endOffset > textNode.length) {
                    const rangeExcess = range.endOffset - textNode.length;
                    if (range.startOffset - rangeExcess === 0) return true;
                }
            }
        }
        return false;
    }

    public getStylesAtCaret(): FormattingName[] {
        const selection = this.getSelection();
        if (!selection) return [];
        const range = selection.getRangeAt(0);

        const formatting: FormattingName[] = [];

        let parentChecking = range.commonAncestorContainer;
        while (parentChecking) {
            if (parentChecking === this.editableDiv) break;
            const element = parentChecking as HTMLElement;
            const formattingName = this.getNodeFormatting(element);
            if (formattingName) formatting.push(formattingName);
            if (!parentChecking.parentNode) break;
            parentChecking = parentChecking.parentNode;
        }

        if (range.collapsed) return [...new Set(formatting)];

        const fragment = range.cloneContents();
        const fragmentFormatting = this.getNodeChildrenFormatting(fragment);
        formatting.push(...fragmentFormatting);

        return [...new Set(formatting)];
    }

    public getNodeChildrenFormatting(node: Node): FormattingName[] {
        const formatting: FormattingName[] = [];
        for (const childNode of node.childNodes) {
            const formattingName = this.getNodeFormatting(childNode);
            if (formattingName) formatting.push(formattingName);
            if (childNode.childNodes.length > 0) {
                const childrenFormatting = this.getNodeChildrenFormatting(childNode);
                formatting.push(...childrenFormatting);
            }
        }
        return formatting;
    }

    public getNodeFormatting(node: Node): FormattingName | void {
        if (node.nodeType === Node.TEXT_NODE) return;
        const element = node as HTMLElement;

        formattingChecking:
            for (const tool of toolsConfig) {
                if (element.tagName.toLowerCase() !== tool.tag) continue;
                if (tool.classes) {
                    for (const className of tool.classes) {
                        if (!element.classList.contains(className))
                            continue formattingChecking;
                    }
                }
                if (tool.styles) {
                    for (const styleName in tool.styles) {
                        if (!element.style[styleName])
                            continue formattingChecking;

                        if (tool.styles[styleName] !== '' && element.style[styleName] !== tool.styles[styleName])
                            continue formattingChecking;
                    }
                }
                if (tool.attributes) {
                    for (const attributeName in tool.attributes) {
                        if (!element.hasAttribute(attributeName))
                            continue formattingChecking;
                        if (tool.attributes[attributeName] !== '' && element.getAttribute(attributeName) !== tool.attributes[attributeName])
                            continue formattingChecking;
                    }
                }
                return tool.name;
            }

        return;
    }

}