import FormattingReader from '../utilities/formatting-reader/formatting-reader.ts';
import FormattingSummary from '../utilities/formatting-reader/entities/formatting-summary.ts';
import SelectionStateType from '../../core/selection/enums/selection-state-type.enum.ts';
import Core from '../../core/core.ts';

class FormattingReaderPort {

    private formattingReader: FormattingReader;

    constructor(private readonly core: Core) {
        this.formattingReader = new FormattingReader(this.core);
    }

    public getSelectionFormatting(selectionType: SelectionStateType): FormattingSummary {
        return this.formattingReader.getSelectionFormatting(selectionType);
    }

    public getCurrentFormatting(): FormattingSummary {
        return this.formattingReader.getSelectionFormatting(SelectionStateType.CURRENT);
    }

    public getNodesFormatting(nodes: Node[]): FormattingSummary {
        return this.formattingReader.getNodesFormatting(nodes);
    }

    public getInsertionPointFormatting(): FormattingSummary {
        return this.formattingReader.getInsertionPointFormatting();
    }
}

export default FormattingReaderPort;