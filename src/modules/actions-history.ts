import { HistoryAction } from '../types/history-action.type.ts';
import { EditorInitializer } from './editor-Initializer.ts';
import { NodeOrFalse } from '../types/node-or-false.type.ts';
import { DetailedSelection } from '../types/detailed-selection.type.ts';

export class ActionsHistory {
    private actions: HistoryAction[] = [];
    // private actions: HistoryAction[] | HistoryAction[][] = [];
    private savedText: string = '';
    private savedStyle: string | null = null;
    private savedProperty: string | null = null;

    // Variables para el manejo del historial de escritura
    private writingSelection: Range | null = null;
    private writingContent: string = '';

    constructor(private readonly depreditor: EditorInitializer) {}

    public setUndoListener() {

        // TODO: Guardar la selección al hacer focus
        this.depreditor.editableDiv.addEventListener('keydown', (e) => {
            const keyboardEvent = e as KeyboardEvent;
            this.processWriting(keyboardEvent);
        });

        this.depreditor.editableDiv.addEventListener('keyup', (e) => {
            const keyboardEvent = e as KeyboardEvent;
            if (keyboardEvent.code.startsWith('Arrow')) {
                this.initWritingEvent();
            }
        });

        document.addEventListener('keydown', (e) => {
            const keyboardEvent = e as KeyboardEvent;
            if (keyboardEvent.code === 'KeyZ' && keyboardEvent.ctrlKey) {
                if (this.depreditor.selectionOnEditableDiv()) {
                    e.preventDefault();
                    this.undo();
                } else if (e.target === document.body) {
                    e.preventDefault();
                }
            }
        });

        this.depreditor.editableDiv.addEventListener('mouseup', () => {
            this.initWritingEvent();
        });

    }

    public destroyListeners() {
    }

    public saveState(style?: string, property?: string) {
        this.savedStyle = style || null;
        this.savedText = window.getSelection()?.getRangeAt(0)
            .cloneRange()
            .cloneContents()
            .textContent || '';
        console.log('saveState', this.savedText);
        this.savedProperty = property || null;
    }

    public saveRange() {
        const selection = window.getSelection();
        if (!selection || !selection.focusNode) return;
        this.actions.push({
            range: selection.getRangeAt(0).cloneRange(),
            previousData: this.savedText || '',
            styling: this.savedStyle,
            property: this.savedProperty,
        });
    }

    public undo() {

        if (this.writingContent !== '') {
            this.initWritingEvent();
        }

        if (this.actions.length === 0) return;
        const action = this.actions.pop()!;
        // if (Array.isArray(action)) {
        //
        // }
        if (action.styling) {
            this.restoreStyle(action);
        } else {
            this.restoreContent(action);
        }
        return true;
    }

    private restoreContent(action: HistoryAction) {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(action.range);
        const range = selection!.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(action.previousData));
    }

    private restoreStyle(action: HistoryAction) {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(action.range);
        if (['text', 'background'].includes(action.styling!)) {
            console.log(action.styling, action.property);
            this.depreditor.formatter.setColor(action.styling as 'text' | 'background', action.property!, true);
        } else {
            this.depreditor.formatter.format(action.styling!, true);
        }
    }

    private initWritingEvent() {
        if (this.writingSelection && this.writingContent !== '') {
            this.saveWritingEvent();
        }
        const range = this.getCurrentRange();
        this.writingContent = '';
        this.writingSelection = range;
    }

    private processWriting(keyboardEvent: KeyboardEvent) {
        if (
            keyboardEvent.key.length === 1
            && !keyboardEvent.ctrlKey
            && !keyboardEvent.metaKey
            && !keyboardEvent.altKey
        ) {
            this.writingContent += keyboardEvent.key;
        }
    }

    private saveWritingEvent() {
        const range = this.writingSelection!;
        range.setEnd(
            range.startContainer,
            range.startOffset + this.writingContent.length,
        );
        this.actions.push({
            range,
            previousData: '',
            styling: null,
            property: null,
        });
    }

    private getCurrentRange(): Range {
        const selection = this.depreditor.selectionOnEditableDiv();
        return selection!.getRangeAt(0).cloneRange();
    }

    public undoContainer(ancestorPath: number[], startPoint: number, structure: NodeOrFalse[], forceRemovePrevious: boolean = false, forceRemoveNext: boolean = false) {
        const ancestor = this.depreditor.node.getNodeByPath(ancestorPath);
        if (!ancestor) return;

        if (forceRemoveNext || structure.length > 1 && structure[structure.length - 1] !== false) {
            const lastNodeOffset = (
                (structure.length > 1 && structure[0] === false)
                || (structure.length === 1 && !forceRemovePrevious)
            ) ? 1 : 2;
            ancestor.removeChild(ancestor.childNodes[startPoint + lastNodeOffset]);
        }
        if (forceRemovePrevious || (structure[0] !== false && structure.length > 1))
            ancestor.removeChild(ancestor.childNodes[startPoint]);

        const containerNode = this.depreditor.node.getNodeByIndex(startPoint, ancestor);
        if (!containerNode) return;

        const restoredFragment = this.restoreStructure(containerNode, structure);
        ancestor.replaceChild(restoredFragment, containerNode);
    }

    public restoreStructure(parent: Node, structure: NodeOrFalse[]): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const nodesList: Node[] = [];
        const containerContent = parent.childNodes;

        for (let i = 0, s = 0; s < structure.length; i++, s++) {
            if (structure[s] === false) {
                nodesList.push(containerContent[i]);
                continue;
            }

            const newNode = Array.isArray(structure[s])
                ? this.restoreStructure(containerContent[i], structure[s])
                : structure[s] as Node;

            nodesList.push(newNode);
        }
        fragment.append(...nodesList);
        return fragment;
    }

    public createStructuralBackup(selection: DetailedSelection, copiedNodes: NodeListOf<ChildNode>) {
        console.log('COPIED NODES', copiedNodes);
        const affectedNodes = this.depreditor.node.getAffectedNodes();
        const rebuildScheme = this.depreditor.node.compareChildNodes(affectedNodes, Array.from(copiedNodes));

        const commonAncestor = selection.sameNode
            ? selection.range!.commonAncestorContainer.parentNode!
            : selection.range!.commonAncestorContainer;
        const ancestorPath = this.depreditor.node
            .getNodePath(commonAncestor, this.depreditor.editableDiv).path;
        console.log('affectedNodes', affectedNodes);

        // TODO: En caso de que el elementos inicial es el nodo principal: Obtener el indice del último nodo y
        //  restarle la cantidad de nodos que se encuentran en el array de los nodos copiados

        const startElementPath = this.depreditor.node.getNodePath(affectedNodes[0], this.depreditor.editableDiv).path;

        const startPosition = startElementPath[startElementPath.length - 1];
        return {
            ancestorPath,
            startPosition,
            rebuildScheme,
        };
    }

}