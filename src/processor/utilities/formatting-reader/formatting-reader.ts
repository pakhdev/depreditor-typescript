import Core from '../../../core/core.ts';
import FormattingSummary from './helpers/formatting-summary.ts';
import SelectionStateType from '../../../core/selection/enums/selection-state-type.enum.ts';

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

    private getFormattingFromParentNodes(editableDiv: HTMLDivElement, targetNode: Node, summary: FormattingSummary) {
        // Leer el formato de los nodos padre de commonAncestor
        // Registrar todos los nodos de formato en FormattingSummary
    }

}

export default FormattingReader;