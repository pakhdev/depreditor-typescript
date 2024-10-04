import ContainerProperties from '../../../../core/containers/interfaces/container-properties.interface.ts';
import Core from '../../../../core/core.ts';
import FormattingCoverage from '../enums/formatting-coverage.enum.ts';
import FormattingEntry from '../interfaces/formatting-entry.interface.ts';
import MatchingStatus from '../../../../core/containers/enums/matching-status.enum.ts';

class FormattingSummary {

    public entries: FormattingEntry[] = [];
    private formattingCombinations: ContainerProperties[][] = [];

    constructor(private readonly core: Core) {}

    public getSimilar(reference: ContainerProperties): FormattingEntry[] {
        return this.entries.filter(
            entry => this.areMatchingContainers(entry.formatting, reference) === MatchingStatus.SIMILAR,
        );
    }

    public updateFormattingCoverage(activeFormattings: ContainerProperties[]): void {
        this.formattingCombinations.push(activeFormattings);

        const fullCoverageEntries = this.entries.filter(entry => entry.coverage === FormattingCoverage.FULL);
        fullCoverageEntries.forEach(entry => {
            if (!this.formattingCombinations.every(combination => combination.includes(entry.formatting)))
                entry.coverage = FormattingCoverage.PARTIAL;
        });
    }

    public registerFormattingNode(formatting: ContainerProperties, node: Node): void {
        const formattingEntry = this.entries.find(entry => entry.formatting === formatting);
        if (!formattingEntry) {
            this.entries.push({ formatting, nodes: [node], coverage: FormattingCoverage.FULL });
        } else {
            formattingEntry.nodes.push(node);
        }
    }

    private areMatchingContainers(
        elementOrProperties: HTMLElement | ContainerProperties,
        referenceProperties: ContainerProperties,
    ): MatchingStatus {
        if (elementOrProperties.tagName.toLowerCase() !== referenceProperties.tagName.toLowerCase())
            return MatchingStatus.DIFFERENT;

        if (!this.core.containers.areAttributesMatching(elementOrProperties, referenceProperties))
            return MatchingStatus.DIFFERENT;

        if (!this.core.containers.areClassesMatching(elementOrProperties, referenceProperties))
            return MatchingStatus.DIFFERENT;

        return this.core.containers.areStylesMatching(elementOrProperties, referenceProperties);
    }

}

export default FormattingSummary;