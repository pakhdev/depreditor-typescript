import Core from '../../../core/core.ts';
import FormattingSummary from './helpers/formatting-summary.ts';
import SelectionStateType from '../../../core/selection/enums/selection-state-type.enum.ts';
import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';

class FormattingReader {

    constructor(private readonly core: Core) {}

    public getFormatting(selectionType: SelectionStateType): FormattingSummary {
        const summary = new FormattingSummary(this.core);
        this.core.selection.get(selectionType);
        // Leer el formato de los nodos padre de commonAncestor
        // Leer el formato de los nodos hijos de commonAncestor entre los nodos seleccionados
        // Al encontrar un nodo sin nodos hijos registrarlo en el summary
        return summary;
    }

    private getFormattingFromParentNodes(editableDiv: HTMLDivElement, targetNode: Node, summary: FormattingSummary): ContainerProperties[] {
        const formattings: ContainerProperties[] = [];

        let currentNode: Node | null = targetNode;
        while (currentNode !== editableDiv && currentNode?.parentNode) {
            const formatting = this.core.containers.identify(currentNode);
            if (formatting) {
                if (!formattings.some(f => f === formatting))
                    formattings.push(formatting);
                summary.registerFormattingNode(formatting, currentNode);
            }
            currentNode = currentNode.parentNode;
        }

        return formattings;
    }

}

export default FormattingReader;