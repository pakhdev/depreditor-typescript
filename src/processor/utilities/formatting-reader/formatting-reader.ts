import AffectedNodes from '../../../core/selection/interfaces/affected-nodes.interface.ts';
import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';
import Core from '../../../core/core.ts';
import FormattingSummary from './helpers/formatting-summary.ts';
import SelectionStateType from '../../../core/selection/enums/selection-state-type.enum.ts';

class FormattingReader {

    constructor(private readonly core: Core) {}

    public getFormatting(selectionType: SelectionStateType): FormattingSummary {
        const summary = new FormattingSummary(this.core);
        const selection = this.core.selection.get(selectionType);
        const parentFormattings = this.scanParentsFormatting(selection.editableDiv, selection.commonAncestor.node, summary);
        this.scanChildrenFormatting(selection.getAffectedNodes(AffectedNodesPart.WITHIN), parentFormattings, summary);
        return summary;
    }

    private scanParentsFormatting(editableDiv: HTMLDivElement, targetNode: Node, summary: FormattingSummary): ContainerProperties[] {
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

    private scanChildrenFormatting(affectedNodes: AffectedNodes[], parentFormattings: ContainerProperties[], summary: FormattingSummary): void {
        const formattings: ContainerProperties[] = [...parentFormattings];

        for (const affectedNode of affectedNodes) {
            const nodeFormatting = this.core.containers.identify(affectedNode.node);
            if (nodeFormatting) {
                if (!formattings.some(f => f === nodeFormatting))
                    formattings.push(nodeFormatting);
                summary.registerFormattingNode(nodeFormatting, affectedNode.node);
            }
            if (affectedNode.node.hasChildNodes())
                this.scanChildrenFormatting(affectedNode.children, formattings, summary);
            else
                summary.updateFormattingCoverage(formattings);
        }
    }
}

export default FormattingReader;