import AffectedNodes from '../../../core/selection/interfaces/affected-nodes.interface.ts';
import AffectedNodesPart from '../../../core/selection/enums/affected-nodes-part.enum.ts';
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
            this.processNodeFormatting(currentNode, formattings, summary);
            currentNode = currentNode.parentNode;
        }

        return formattings;
    }

    private scanChildrenFormatting(affectedNodes: AffectedNodes[], parentFormattings: ContainerProperties[], summary: FormattingSummary): void {
        for (const affectedNode of affectedNodes) {
            const formattings: ContainerProperties[] = [...parentFormattings];
            this.processNodeFormatting(affectedNode.node, formattings, summary);
            if (affectedNode.node.hasChildNodes())
                this.scanChildrenFormatting(affectedNode.children, formattings, summary);
            summary.updateFormattingCoverage(formattings);
        }
    }

    private processNodeFormatting(node: Node, formattings: ContainerProperties[], summary: FormattingSummary): void {
        const nodeFormatting = this.core.containers.identify(node);
        if (nodeFormatting) {
            if (!formattings.some(f => f === nodeFormatting))
                formattings.push(nodeFormatting);
            summary.registerFormattingNode(nodeFormatting, node);
        }
    }
}

export default FormattingReader;