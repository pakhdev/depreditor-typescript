import { EditorInitializer } from './editor-Initializer.ts';
import { FormattingName } from '../types';
import { toolsConfig } from '../tools.config.ts';
import { DetailedSelection } from '../types/detailed-selection.type.ts';
import { CaretFormattings } from '../types/caret-formattings.type.ts';
import { RelativeSelection } from '../types/relative-selection.type.ts';

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

    public inspectSelection(): DetailedSelection | void {
        const selection = this.getSelection();
        if (!selection) return;
        const range = selection.getRangeAt(0);

        const selectionDetails = {
            isRange: !range.collapsed,
            range: selection.rangeCount > 0 ? range : null,
            sameNode: range.startContainer === range.endContainer,
            commonAncestor: range.commonAncestorContainer,
            startNode: {
                node: range.startContainer,
                fullySelected: false,
                startSelected: false,
                endSelected: false,
                start: 0,
                end: 0,
                length: range.startContainer.textContent?.length,
            },
            endNode: {
                node: range.endContainer,
                fullySelected: false,
                startSelected: false,
                endSelected: false,
                start: 0,
                end: 0,
                length: range.endContainer.textContent?.length,
            },
        };

        // Detectar la selección de un br
        if (range.startContainer === selectionDetails.commonAncestor) {
            const newStartNode = this.prepareBrSelection(range.startOffset, selectionDetails.commonAncestor);
            if (newStartNode) selectionDetails.startNode = newStartNode;
            if (selectionDetails.isRange) selectionDetails.sameNode = false;
        }

        if (range.endContainer === selectionDetails.commonAncestor) {
            const newEndNode = this.prepareBrSelection(range.endOffset, selectionDetails.commonAncestor);
            if (newEndNode) selectionDetails.endNode = newEndNode;
            if (selectionDetails.isRange) selectionDetails.sameNode = false;
        }

        if ( // Detectar la situación cuando el cursor se queda en un nodo de texto vacío
            !selectionDetails.endNode.node.textContent
            && selectionDetails.endNode.node.previousSibling === selectionDetails.startNode.node
        ) {
            selectionDetails.endNode = selectionDetails.startNode;
            selectionDetails.sameNode = true;
        }

        // Detectar la posición del caret en un nodo de texto
        if (range.startContainer.nodeType === Node.TEXT_NODE) {
            const textNode = range.startContainer as Text;
            selectionDetails.startNode.start = range.startOffset;
            selectionDetails.startNode.end = range.startContainer !== range.endContainer
                ? textNode.length
                : range.endOffset;
            selectionDetails.startNode.startSelected = selectionDetails.startNode.start === 0;
            selectionDetails.startNode.endSelected = selectionDetails.startNode.end === textNode.length;
            selectionDetails.startNode.fullySelected = selectionDetails.startNode.startSelected && selectionDetails.startNode.endSelected;
        }

        if (range.endContainer.nodeType === Node.TEXT_NODE) {
            const endTextNode = range.endContainer as Text;
            selectionDetails.endNode.start = range.startContainer !== range.endContainer
                ? 0
                : range.startOffset;
            selectionDetails.endNode.end = range.endOffset;
            selectionDetails.endNode.startSelected = selectionDetails.endNode.start === 0;
            selectionDetails.endNode.endSelected = selectionDetails.endNode.end === endTextNode.length;
            selectionDetails.endNode.fullySelected = selectionDetails.endNode.startSelected && selectionDetails.endNode.endSelected;
        }

        return selectionDetails;

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
                if (this.depreditor.node.hasStyle('code', nextSibling)) {
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
            if (this.depreditor.node.hasStyle('code', checkingParentNode)) return true;
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

    public getStylesAtCaret(): FormattingName[] {
        const selection = this.depreditor.caret.inspectSelection();
        if (!selection) return [];
        const formattings: FormattingName[] = [];

        // Obtener los estilos de los nodos padres para ver los estilos aplicados
        const parent = selection.sameNode
            ? selection.startNode.node
            : selection.commonAncestor;
        const parentFormatting = this.depreditor.node.getParentsFormatting(parent);
        formattings.push(...parentFormatting);

        // Obtener los estilos de los nodos hijos de los elementos seleccionados
        if (selection.isRange) {
            const fragment = selection.range!.cloneContents();
            const fragmentFormatting = this.depreditor.node.getNodeChildrenFormatting(fragment);
            formattings.push(...fragmentFormatting);
        }

        if (!formattings.includes('paragraph-left') && this.depreditor.node.hasUnalignedNodes(parent))
            formattings.push('paragraph-left');

        return [...new Set(formattings)];
    }

    private prepareBrSelection(offset: number, parentNode: Node): Object | void {
        const editableDivChildNode = parentNode.childNodes[offset];
        if (!editableDivChildNode) return;
        return {
            node: editableDivChildNode,
            fullySelected: true,
            startSelected: true,
            endSelected: true,
            start: 0,
            end: 0,
            length: 0,
        };
    }

    public getRelativeSelection(): RelativeSelection | void {
        const selection = this.depreditor.caret.inspectSelection();
        if (!selection) return;
        const ancestorChildNodes = Array.from(selection.commonAncestor.childNodes);
        const startIndex = ancestorChildNodes.findIndex(node => this.depreditor.node.containsNode(node, selection.startNode.node));
        const endIndex = ancestorChildNodes.findIndex(node => this.depreditor.node.containsNode(node, selection.endNode.node)) + 1;
        return {
            startNode: this.depreditor.node.getNodePath(selection.startNode.node, this.editableDiv),
            startOffset: selection.startNode.start,
            endNode: this.depreditor.node.getNodePath(selection.endNode.node, this.editableDiv),
            endOffset: selection.endNode.end,
            affectedNodesCount: endIndex - startIndex,
        };
    }

    public setRelativeSelection(relativeSelection: RelativeSelection): void {
        const startNode = this.depreditor.node.getNodeByPath(relativeSelection.startNode.path);
        const endNode = this.depreditor.node.getNodeByPath(relativeSelection.endNode.path);

        if (startNode && endNode) {
            const selection = window.getSelection();
            if (selection) {
                const range = document.createRange();
                range.setStart(startNode, relativeSelection.startOffset);
                range.setEnd(endNode, relativeSelection.endOffset);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    public selectNode(node: Node, range: Range): DetailedSelection {
        range.selectNode(node);
        return this.inspectSelection()!;
    }

}