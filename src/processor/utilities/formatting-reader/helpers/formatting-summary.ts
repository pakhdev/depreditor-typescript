import ContainerProperties from '../../../../core/containers/interfaces/container-properties.interface.ts';
import Core from '../../../../core/core.ts';
import FormattingEntry from '../interfaces/formatting-entry.interface.ts';

class FormattingSummary {

    public entries: FormattingEntry[] = [];

    constructor(private readonly core: Core) {}

    public filterSimilar(reference: ContainerProperties): FormattingEntry[] {
        // Devolver todos los entries que tengan un formato similar al de reference
        return this.entries;
    }

    public updateFormattingCoverage(): void {
        // Recibir formattings y comprar con los existentes
    }

    public registerFormattingNode(formatting: ContainerProperties, node: Node): void {
        // Si no existe un entry con el mismo formato, crear uno
        // Si existe un entry con el mismo formato, agregar el nodo al entry
    }

}

export default FormattingSummary;