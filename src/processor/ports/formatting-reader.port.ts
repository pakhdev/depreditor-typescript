import FormattingReader from '../utilities/formatting-reader/formatting-reader.ts';
import FormattingSummary from '../utilities/formatting-reader/helpers/formatting-summary.ts';
import SelectionStateType from '../../core/selection/enums/selection-state-type.enum.ts';

class FormattingReaderPort {
    constructor(private readonly formattingReader: FormattingReader) {}

    public getFormatting(selectionType: SelectionStateType): FormattingSummary {
        return this.formattingReader.getFormatting(selectionType);
    }

    public getCurrentFormatting(): FormattingSummary {
        return this.formattingReader.getFormatting(SelectionStateType.CURRENT);
    }
}

export default FormattingReaderPort;