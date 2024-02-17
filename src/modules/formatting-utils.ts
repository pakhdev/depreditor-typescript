import { EditorInitializer } from './editor-Initializer.ts';
import { ContainerProps } from '../types/container-props.type.ts';
import { DetailedSelection } from '../types/detailed-selection.type.ts';
import { toolsConfig } from '../tools.config.ts';
import { RelativeSelection } from '../types/relative-selection.type.ts';
import { NodeSelection } from '../types/nodes-selection.type.ts';
import { InsertingOptions } from '../types/inserting-options.type.ts';

export class FormattingUtils {

    constructor(private readonly depreditor: EditorInitializer) {}

    public format(style: string, avoidHistory?: boolean): void {
        if (!this.depreditor.caret.getSelection()) return;
        document.execCommand(style, false);
        if (avoidHistory) return;
        this.depreditor.history.saveState(style);
        this.depreditor.history.saveRange();
    }

    public setHidden(): void {
        if (!this.depreditor.caret.getSelection()) return;
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

    public insertList(type: string): void {
        document.execCommand(type === 'numbered'
            ? 'insertOrderedList'
            : 'insertUnorderedList',
        );
    }

    public insertElement(element: HTMLElement): void {
        this.depreditor.popup.hidePopup();
        this.depreditor.caret.restoreRange();
        const selection = this.depreditor.caret.getSelection();
        if (!selection) return;
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

    public setColor(type: 'text' | 'background', color: string, avoidHistory?: boolean): void {
        this.depreditor.popup.hidePopup();
        this.depreditor.caret.restoreRange();
        // RESTORE SELECTION FROM HISTORY
        const oldColor = type === 'text'
            ? this.depreditor.node.getForeColor()
            : this.depreditor.node.getBackgroundColor();
        type === 'text'
            ? document.execCommand('foreColor', false, color)
            : document.execCommand('hiliteColor', false, color);
        if (!avoidHistory) {
            this.depreditor.history.saveState(type, oldColor!);
            this.depreditor.history.saveRange();
        }
        // this.depreditor.caret.moveCaretToEndOfSelection();
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

    public deleteNode(node: Node): void {
        const selection = this.depreditor.caret.getSelection();
        if (!selection) return;

        const range = selection.getRangeAt(0);
        range.selectNode(node);
        selection.removeAllRanges();
        selection.addRange(range);
        node.parentNode?.removeChild(node);
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

    public apply(props: ContainerProps, saveToHistory: boolean = true): void {
        let selection = this.depreditor.caret.inspectSelection();
        if (!selection) return;

        if (!selection.isRange) {
            if (props.groups) {
                const parentFromGroups = this.depreditor.node.getParentFromGroups(selection.startNode.node, props.groups);
                if (parentFromGroups) selection = this.depreditor.caret.selectNode(parentFromGroups.node, selection.range);
            }
        }

        const content = selection.range?.cloneContents();
        let result = null;

        const parentFormatting = this.depreditor.node.getParentsFormatting(selection.commonAncestor);
        const parentHasFormatting = parentFormatting.includes(props.name);
        const isOverallFormatting = content
            ? this.depreditor.node.isOverallFormatting(props.name, content)
            : false;
        const formattingMode: 'inline' | 'block' = ['a', 'b', 'u', 'i', 'span'].includes(props.tag)
            ? 'inline'
            : 'block';

        console.log('Parent has formatting:', parentHasFormatting);
        console.log('isOverallFormatting:', isOverallFormatting);
        const action: 'apply' | 'remove' = parentHasFormatting || isOverallFormatting
            ? 'remove'
            : 'apply';

        // TODO: Obtener los elementos seleccionados
        // TODO: Después de aplicar el formato comprobar la cantidad resultante
        // TODO: Guardar en el historial (la selección relativa, la acción), (copia del contenido inicial y la cantidad
        //  de nodos resultante)

        if (formattingMode === 'inline') {
            result = action === 'apply'
                ? this.setInlineFormatting(props, selection)
                : this.removeInlineFormatting(props, selection);
            return;
        }

        if (formattingMode === 'block') {
            if (action === 'remove') return;
            result = this.setContainer(props, selection, content);
        }

        // TODO: Comprobar que no da problema al revertir los cambios
        if (selection.startNode.node !== selection.endNode.node)
            this.cleanEmptyNodes(selection.endNode.node, selection.commonAncestor);

        this.cleanEmptyNodes(selection.startNode.node, selection.commonAncestor);

        // TODO: Eliminar al terminar de probar
        console.log('Result:', result);
        // this.depreditor.history.undoContainer(result!);

        if (saveToHistory && result) {
            // TODO: Guardar el resultado en el historial
        }
    }

    private setContainer(props: ContainerProps, selection: DetailedSelection, content?: DocumentFragment) {
        let makeFullBackup = false;
        const container = this.createElement(props);
        if (content) {
            if (this.clearSameGroupContainers(props, Array.from(content.childNodes)))
                makeFullBackup = true;
            container.appendChild(content);
        }

        const relativeSelection: RelativeSelection = this.depreditor.caret.getRelativeSelection()!;
        const structuralBackup = this.depreditor.history.createStructuralBackup(selection, container.childNodes, makeFullBackup);
        selection.range?.deleteContents();
        selection.range?.insertNode(container);
        return structuralBackup;
    }

    private setInlineFormatting(props: ContainerProps, selection: DetailedSelection) {
        const nodesToFormat: NodeSelection = this.depreditor.node.getNodesToFormat(selection);
        console.log('Nodes to format:', nodesToFormat);

        for (const node of nodesToFormat) {
            const nodesArray = Array.isArray(node) ? node : [node];
            this.insertNodes({
                nodes: nodesArray,
                position: this.depreditor.node.getNodePath(nodesArray[0].node),
                removeNodesCount: nodesArray.length,
                startNode: selection.startNode.node,
                endNode: selection.endNode.node,
            }, props);
        }
    }

    private removeInlineFormatting(props: ContainerProps, selection: DetailedSelection) {
        // TODO: Encontrar los nodos que contienen el formato dentro de la selección y eliminarlos
        // TODO: Devolver la selección (path numérico) y posición del cursor para poder deshacer la acción
    }

    private cleanEmptyNodes(node: Node, stopNode: Node) {
        if (!this.depreditor.node.isNodeEmpty(node)) {
            return;
        }
        while (node.parentNode !== stopNode) {
            if (node.parentNode && this.depreditor.node.isNodeEmpty(node.parentNode)) {
                node = node.parentNode;
            } else {
                break;
            }
        }
        node.parentNode?.removeChild(node);
    }

    private clearSameGroupContainers(props: ContainerProps, nodes: Node[]) {
        if (!props.groups) return false;
        let containersFound = false;

        const groupFormattingNames = toolsConfig
            .filter(tool => tool.groups && tool.groups.some(value => props.groups!.includes(value)))
            .map(tool => tool.name);

        for (const node of nodes) {
            if (node.nodeType === Node.TEXT_NODE) continue;
            for (const formattingName of groupFormattingNames) {
                if (!this.depreditor.node.hasStyle(formattingName, node)) continue;

                if (node.childNodes.length > 0)
                    this.clearSameGroupContainers(props, Array.from(node.childNodes));

                const fragment = this.makeFragment(node);

                node.parentNode?.replaceChild(fragment, node);
                containersFound = true;
                break;
            }
        }
        return containersFound;
    }

    private makeFragment(node: Node | Node[]): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const nodesList: Node[] = [];
        let sourceNodes: Node[] = [];

        if (Array.isArray(node)) {
            sourceNodes.push(...node);
        } else if (node.hasChildNodes()) {
            sourceNodes.push(...Array.from(node.childNodes));
        }

        for (const childNode of sourceNodes) {
            nodesList.push(childNode);
        }
        fragment.append(...nodesList);
        return fragment;
    }

    private createElement(props: ContainerProps, content?: DocumentFragment): HTMLElement {
        const container = document.createElement(props.tag);
        if (props.classes)
            container.classList.add(...props.classes);
        if (props.styles) {
            for (const [key, value] of Object.entries(props.styles)) {
                container.style[key] = value;
            }
        }
        if (content) container.appendChild(content);
        return container;
    }

    public insertNodes(insertingOptions: InsertingOptions, containerProps?: ContainerProps): void {
        const nodesToInsert: Node[] = [];
        const parentNode = insertingOptions.nodes[0].node.parentNode!;
        const sameNode = insertingOptions.startNode === insertingOptions.endNode;
        let startIndex = insertingOptions.position.path[0];
        let nodesToRemoveCount = insertingOptions.removeNodesCount || insertingOptions.nodes.length;

        if (insertingOptions.startNode && insertingOptions.endNode) {
            if (insertingOptions.nodes.some(node => node.node === insertingOptions.startNode && !node.fullySelected)) {
                nodesToRemoveCount--;
                startIndex++;
            }
            if (!sameNode && insertingOptions.nodes.some(node => node.node === insertingOptions.endNode && !node.fullySelected))
                nodesToRemoveCount--;
        }

        const nodesToRemove = Array
            .from(parentNode!.childNodes)
            .slice(startIndex, startIndex + nodesToRemoveCount);

        for (const element of insertingOptions.nodes) {
            if (element.fullySelected) {
                nodesToInsert.push(element.node.cloneNode(true));
                continue;
            }
            const textBeforeSelection = element.node.textContent!.substring(0, element.start);
            const selectedText = element.node.textContent!.substring(element.start, element.end);
            const textAfterSelection = element.node.textContent!.substring(element.end);
            nodesToInsert.push(document.createTextNode(selectedText));

            if (sameNode && textAfterSelection.length)
                startIndex--;

            let textForExistingNode = textAfterSelection;
            if (!sameNode || !textBeforeSelection.length) {
                textForExistingNode = textBeforeSelection + textForExistingNode;
            } else {
                parentNode.insertBefore(document.createTextNode(textBeforeSelection), parentNode.childNodes[startIndex]);
                startIndex++;
            }
            element.node.textContent = textForExistingNode;
        }

        const fragmentToInsert = containerProps
            ? this.createElement(containerProps, this.makeFragment(nodesToInsert))
            : this.makeFragment(nodesToInsert);
        parentNode.insertBefore(fragmentToInsert, parentNode.childNodes[startIndex]);
        nodesToRemove.forEach(node => parentNode.removeChild(node));
    }

}