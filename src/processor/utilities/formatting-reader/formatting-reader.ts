import AffectedNodes from '../../../core/selection/interfaces/affected-nodes.interface.ts';
import AffectedNodesPart from '../../../core/selection/enums/affected-nodes-part.enum.ts';
import ContainerProperties from '../../../core/containers/interfaces/container-properties.interface.ts';
import Core from '../../../core/core.ts';
import FormattingSummary from './entities/formatting-summary.ts';
import SelectionStateType from '../../../core/selection/enums/selection-state-type.enum.ts';

class FormattingReader {
    constructor(private readonly core: Core) {}

    public getSelectionFormatting(selectionType: SelectionStateType): FormattingSummary {
        const summary = new FormattingSummary(this.core);
        const selection = this.core.selection.get(selectionType);
        const parentFormattings = this.scanParentsFormatting(selection.editableDiv, selection.commonAncestor.node, summary);
        this.scanChildrenFormatting(selection.getAffectedNodes(AffectedNodesPart.WITHIN), parentFormattings, summary);
        return summary;
    }

    public getNodesFormatting(nodes: Node[]): FormattingSummary {
        const summary = new FormattingSummary(this.core);
        if (!nodes.length)
            return summary;

        let parentFormattings: ContainerProperties[] = [];
        if (nodes[0].parentNode)
            parentFormattings = this.scanParentsFormatting(this.core.editableDiv, nodes[0].parentNode, summary);

        this.scanChildrenFormatting(nodes, parentFormattings, summary);
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

    private scanChildrenFormatting(children: AffectedNodes[] | Node[], parentFormattings: ContainerProperties[], summary: FormattingSummary): void {
        for (const child of children) {
            const formattings: ContainerProperties[] = [...parentFormattings];
            const childNode = child instanceof Node ? child : child.node;
            const childChildren = child instanceof Node ? Array.from(child.childNodes) : child.children;
            this.processNodeFormatting(childNode, formattings, summary);
            if (childNode.hasChildNodes())
                this.scanChildrenFormatting(childChildren, formattings, summary);
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