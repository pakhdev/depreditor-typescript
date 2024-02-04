import { EditorInitializer } from './editor-Initializer.ts';
import { ContainerProps } from '../types/container-props.type.ts';
import { DetailedSelection } from '../types/detailed-selection.type.ts';

export class FormattingUtils {

    constructor(private readonly depreditor: EditorInitializer) {}

    public format(style: string, avoidHistory?: boolean): void {
        if (!this.depreditor.caret.getSelection()) return;
        document.execCommand(style, false);
        if (avoidHistory) return;
        this.depreditor.history.saveState(style);
        this.depreditor.history.saveRange();
    }

    public insertCode(): void {
        if (!this.depreditor.caret.getSelection()) return;
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

    public align(direction: string, avoidHistory?: boolean): void {
        const previousAlignment = this.depreditor.node.getAlignment();
        document.execCommand('justify' + direction);
        if (avoidHistory || !previousAlignment) return;
        this.depreditor.history.saveState(previousAlignment);
        this.depreditor.history.saveRange();
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

    public injectContainer(props: ContainerProps): void {
        const selection = this.depreditor.caret.getSelection();
        if (!selection) return;

        this.depreditor.caret.saveRange(); // Guardar la selección de forma automática
        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;

        // Si solo hay un nodo seleccionado
        if (startContainer === endContainer) {
            if (this.depreditor.caret.isTextNodeFullySelected()) {
                const parenNode = startContainer.parentNode;
                if (parenNode && parenNode.childNodes.length === 1) {
                    range.selectNode(parenNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }

        const commonAncestor = range.commonAncestorContainer;
        const startContainerParent = this.depreditor.node.findFirstParent(startContainer, commonAncestor);
        const endContainerParent = this.depreditor.node.findFirstParent(endContainer, commonAncestor);
        console.log(startContainerParent, endContainerParent);
        if (startContainerParent === endContainerParent) console.log('Los elementos seleccionados están en el mismo contenedor');

        const container = document.createElement(props.tag);
        if (props.classes) container.classList.add(...props.classes);

        if (selection.rangeCount > 0) container.appendChild(range.cloneContents());

        range.deleteContents();
        range.insertNode(container);

        if (this.depreditor.node.isNodeEmpty(startContainer)) startContainer.parentNode?.removeChild(startContainer);
    }

    public apply(props: ContainerProps, saveToHistory: boolean = true) {
        const selection = this.depreditor.caret.inspectSelection();
        if (!selection) return;
        let result = null;
        const formattingMode: 'inline' | 'block' = ['a', 'b', 'u', 'i', 'span'].includes(props.tag)
            ? 'inline'
            : 'block';
        const action: 'apply' | 'remove' = this.depreditor.caret.getStylesAtCaret().includes(props.name)
            ? 'remove'
            : 'apply';

        if (formattingMode === 'inline') {
            result = action === 'apply'
                ? this.setInlineFormatting(props, selection)
                : this.removeInlineFormatting(props, selection);
        }

        if (formattingMode === 'block') {
            result = action === 'apply'
                ? this.setContainer(props, selection)
                : this.removeContainer(props, selection);
        }

        // TODO: Realizar la limpieza de nodos vacíos

        if (saveToHistory && result) {
            // TODO: Guardar el resultado en el historial
        }
    }

    private setContainer(props: ContainerProps, selection: DetailedSelection) {
        // Preparar el contenedor
        const container = document.createElement(props.tag);
        if (props.classes) container.classList.add(...props.classes);
        const content = selection.range?.cloneContents();
        if (content) container.appendChild(content);

        // TODO: Si solo está seleccionado un nodo de texto parcialmente, guardar el texto que no está seleccionado
        if (selection.sameNode) {
            if (!selection.startNode.startSelected) {
                console.log(selection.startNode.node.textContent?.slice(0, selection.startNode.start));
                // Если выделение не в начале, запомнить путь выделенного элемента
            }
            if (!selection.endNode.endSelected) {
                console.log(selection.endNode.node.textContent?.slice(selection.endNode.end, selection.endNode.length));
                // Если выделение не в конце, запомнить путь выделенного элемента + 2
            }
        } else {
            // TODO: Si están seleccionados varios nodos, extraer elementos que fáltan por seleccionar de los nodos
            //  afectados
            const affectedNodes = this.depreditor.node.getAffectedNodes();
            const rebuildScheme = this.depreditor.node.compareChildNodes(affectedNodes, Array.from(container.childNodes));
            const removePrevious = rebuildScheme[0] !== false;
            const removeNext = rebuildScheme.length > 1 && rebuildScheme[rebuildScheme.length - 1] !== false;

            console.log(rebuildScheme, removePrevious, removeNext);
            const restoreStartPoint = this.depreditor.node.getNodePath(affectedNodes[0], this.depreditor.editableDiv);
        }

        // Reemplazar el contenido seleccionado por el contenedor
        selection.range?.deleteContents();
        selection.range?.insertNode(container);

        // TODO: Devolver elementos a eliminar (path numérico) para poder deshacer la acción
        // TODO: Devolver texto (prepend + append) o nodos que habría que restaurar al deshacer la acción
        // TODO: Devolver elemento contenedor creado (path numérico) para poder deshacer la acción
    }

    private removeContainer(props: ContainerProps, selection: DetailedSelection) {
        // TODO: Extraer el contenido del contenedor, añadir nodos faltanes, añadirlo al nodo padre y eliminar el
        //  contenedor
        // TODO: Devolver la selección (path numérico) y posición del cursor para poder deshacer la acción
    }

    private setInlineFormatting(props: ContainerProps, selection: DetailedSelection) {
        // TODO: Si la selección no es un rango, aplicar el formato al nodo seleccionado
        // TODO: Obtener todos los nodos de texto dentro de la selección y envolverlos en la etiqueta requerida
        // TODO: Envolver el texto del primer y el último nodo de la selección solo parcialmente si es necesario
        // TODO: Devolver un array con los nodos creados (path numérico) para poder deshacer la acción
    }

    private removeInlineFormatting(props: ContainerProps, selection: DetailedSelection) {
        // TODO: Encontrar los nodos que contienen el formato dentro de la selección y eliminarlos
        // TODO: Devolver la selección (path numérico) y posición del cursor para poder deshacer la acción
    }
}