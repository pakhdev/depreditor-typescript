import ContainerProperties from '../../../../core/containers/interfaces/container-properties.interface.ts';
import Core from '../../../../core/core.ts';
import FormattingEntry from '../interfaces/formatting-entry.interface.ts';
import FormattingCoverage from '../enums/formatting-coverage.enum.ts';

class FormattingSummary {

    public entries: FormattingEntry[] = [];

    constructor(private readonly core: Core) {}

    public filterSimilar(reference: ContainerProperties): FormattingEntry[] {
        // Devolver todos los entries que tengan un formato similar al de reference
        return this.entries;
    }

    public updateFormattingCoverage(formattings: ContainerProperties[]): void {
        // Recibir formattings y comprar con los existentes
    }

    public registerFormattingNode(formatting: ContainerProperties, node: Node): void {
        const formattingEntry = this.entries.find(entry => entry.formatting === formatting);
        if (!formattingEntry) {
            this.entries.push({ formatting, nodes: [node], coverage: FormattingCoverage.FULL });
        } else {
            formattingEntry.nodes.push(node);
        }
    }

}

export default FormattingSummary;