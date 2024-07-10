import ContainerProperties from '../../../../core/containers/interfaces/container-properties.interface.ts';
import FormattingCoverage from '../enums/formatting-coverage.enum.ts';

interface FormattingEntry {
    formatting: ContainerProperties;
    nodes: Node[];
    coverage: FormattingCoverage;
}

export default FormattingEntry;