import AffectedNodes from '../../../core/selection/interfaces/affected-nodes.interface.ts';
import ClonedFragment from './fragments-cloner/helpers/cloned-fragment.ts';
import AffectedNodesPart from '../../../core/selection/enums/affected-nodes-part.enum.ts';
import StoredSelection from '../../../core/selection/helpers/stored-selection.ts';

class FragmentsCloner {

    constructor(private readonly selection: StoredSelection) {}

    public selectedPart(part: AffectedNodesPart): ClonedFragment {
        const clonedFragment = new ClonedFragment();
        const affectedNodes = this.selection.getAffectedNodes(part);
        if (!affectedNodes.length) return clonedFragment;

        affectedNodes.map(node => this.cloneNodeWithChildren(node, clonedFragment, true));
        this.adjustTextNodes(clonedFragment, part);

        return this.fragmentIsNotEmpty(clonedFragment) ? clonedFragment : new ClonedFragment();
    }

    private cloneNodeWithChildren(node: AffectedNodes, clonedFragment: ClonedFragment, isRoot: boolean): Node {
        const clonedNode = node.node.cloneNode();
        clonedFragment.add(node.node, clonedNode, isRoot);
        node.children.forEach(child => {
            clonedNode.appendChild(this.cloneNodeWithChildren(child, clonedFragment, false));
        });
        return clonedNode;
    }

    private adjustTextNodes(clonedFragment: ClonedFragment, part: AffectedNodesPart): void {
        const { startElement, endElement } = this.selection;

        switch (part) {
            case AffectedNodesPart.BEFORE:
                this.adjustTextContent(clonedFragment.findByOriginalNode(startElement.node), 0, startElement.offset.start);
                break;
            case AffectedNodesPart.WITHIN:
                this.adjustTextContent(clonedFragment.findByOriginalNode(startElement.node), startElement.offset.start, startElement.offset.end);
                if (startElement.node !== endElement.node)
                    this.adjustTextContent(clonedFragment.findByOriginalNode(endElement.node), endElement.offset.start, endElement.offset.end);
                break;
            case AffectedNodesPart.AFTER:
                this.adjustTextContent(clonedFragment.findByOriginalNode(endElement.node), endElement.offset.end, undefined);
                break;
        }
    }

    private adjustTextContent(node: Node, start: number, end?: number): void {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent) return;
        if (end === undefined) end = node.textContent.length;
        node.textContent = node.textContent.slice(start, end);
    }

    private fragmentIsNotEmpty(fragment: ClonedFragment | Node[]): boolean {
        const nodes = fragment instanceof ClonedFragment ? fragment.nodes : fragment;
        for (const node of nodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '')
                return true;
            if (node.nodeType === Node.ELEMENT_NODE && !node.childNodes.length)
                return true;
            if (node.hasChildNodes() && this.fragmentIsNotEmpty(Array.from(node.childNodes)))
                return true;
        }
        return false;
    }
}

export default FragmentsCloner;