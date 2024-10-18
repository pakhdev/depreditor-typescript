import ActionResolver from './helpers/action-resolver.ts';
import ActionTypes from './enums/action-types.enum.ts';
import AffectedNodesPart from '../../core/selection/enums/affected-nodes-part.enum.ts';
import Core from '../../core/core.ts';
import OperationsBuilder from '../utilities/operations-builder/operations-builder.ts';
import Processor from '../processor.ts';
import SelectionAdjuster from './helpers/selection-adjuster.ts';
import SelectionWorkspace from '../selection-workspace/selection-workspace.ts';
import DeferredSelectionType from '../../core/transactions-manager/enums/deferred-selection-type.enum.ts';
import ContainerProperties from '../../core/containers/interfaces/container-properties.interface.ts';
import HandlingContext from './interfaces/handling-context.interface.ts';

class CommandHandler {

    constructor(
        private readonly core: Core,
        private readonly processor: Processor,
    ) {}

    public handleInsertion(input: Node[] | string, handlingContext?: HandlingContext) {
        if (!input.length) return;

        const selectionWorkspace = handlingContext?.workspace ?? new SelectionWorkspace(this.core);
        const isInsertingIntoTextNode = selectionWorkspace.selection.commonAncestor.isTextNode;

        if (isInsertingIntoTextNode && (typeof input === 'string' || (input.length === 1 && input[0].nodeType === Node.TEXT_NODE))) {
            const text = typeof input === 'string' ? input : input[0].textContent;
            if (text) this.insertText(text, handlingContext);
        } else {
            if (typeof input === 'string')
                input = [document.createTextNode(input)];
            (input.length === 1)
                ? this.handleElement(input[0], handlingContext)
                : this.insertNodes(input, handlingContext);
        }
    }

    public handleElement(node: Node, handlingContext?: HandlingContext) {
        const selectionWorkspace = handlingContext?.workspace ?? new SelectionWorkspace(this.core);
        this.moveCursorFromTextEdge(selectionWorkspace);

        const operationsBuilder = new OperationsBuilder(selectionWorkspace);
        const containerProperties = this.core.containers.identify(node);
        const action = containerProperties
            ? ActionResolver.resolveContainerAction(selectionWorkspace, containerProperties)
            : ActionTypes.INSERT;
        if (containerProperties)
            SelectionAdjuster.adjust(selectionWorkspace, containerProperties, action);
        else
            return this.insertNodes([node], handlingContext);
        const selectedPart = selectionWorkspace.cloneFragment.selectedPart(AffectedNodesPart.WITHIN).nodes;
        const transactionBuilder = handlingContext?.transactionBuilder || this.core.transactions.builder(selectionWorkspace);

        let newNodes: Node[] = [];
        if (action === ActionTypes.INSERT) {
            if (containerProperties)
                node = this.fillEmptyFormattingNode(node, containerProperties!);
            newNodes = [node];
        } else if (action === ActionTypes.UNWRAP)
            newNodes = this.processor.elementWrapper.unwrap(selectedPart, containerProperties!);
        else if (action === ActionTypes.WRAP)
            newNodes = this.processor.elementWrapper.wrap(selectedPart, node, containerProperties!);
        else if (action === ActionTypes.NONE)
            return;

        const { nodesBefore, nodesAfter } = this.extractBeforeAndAfterNodes(selectionWorkspace);
        const nodesBeforeOps = operationsBuilder.injectNodes(nodesBefore);
        const newNodesOps = operationsBuilder.injectNodes(newNodes);
        const nodesAfterOps = operationsBuilder.injectNodes(nodesAfter);
        const deferredSelectionType = (action === ActionTypes.INSERT)
            ? DeferredSelectionType.INSIDE_FRAGMENT
            : DeferredSelectionType.ENTIRE_FRAGMENT;
        const transaction = transactionBuilder
            .appendInjections([...nodesBeforeOps, ...newNodesOps, ...nodesAfterOps])
            .computeDeferredSelection(newNodesOps, deferredSelectionType)
            .appendRemovals(operationsBuilder.removeSelected())
            .build();
        console.log(transaction);
    }

    public insertText(text: string, handlingContext?: HandlingContext) {
        const selectionWorkspace = new SelectionWorkspace(this.core);
        const operationsBuilder = new OperationsBuilder(selectionWorkspace);
        const isAncestorTextNode = selectionWorkspace.selection.commonAncestor.isTextNode;

        const transactionBuilder = handlingContext?.transactionBuilder ?? this.core.transactions.builder(selectionWorkspace);

        if (!isAncestorTextNode)
            this.insertNodes([document.createTextNode(text)], handlingContext);

        const textInjectionOp = operationsBuilder.injectText(text);

        const transaction = transactionBuilder
            .appendInjections(textInjectionOp)
            .computeDeferredSelection(textInjectionOp, DeferredSelectionType.AFTER_FRAGMENT)
            .appendRemovals(operationsBuilder.removeSelected())
            .build();
        console.log(transaction);
    }

    public insertNodes(newNodes: Node[], handlingContext?: HandlingContext) {
        const selectionWorkspace = new SelectionWorkspace(this.core);
        this.moveCursorFromTextEdge(selectionWorkspace);

        const operationsBuilder = new OperationsBuilder(selectionWorkspace);
        const insertionZoneFormatting = this.processor.formattingReader.getInsertionPointFormatting();
        let newNodesFormatting = this.processor.formattingReader.getNodesFormatting(newNodes);
        const transactionBuilder = handlingContext?.transactionBuilder ?? this.core.transactions.builder(selectionWorkspace);

        insertionZoneFormatting.entries.forEach(entry => {
            if (newNodesFormatting.entries.find(e => e.formatting === entry.formatting))
                this.processor.elementWrapper.unwrap(newNodes, entry.formatting);
        });

        newNodesFormatting = this.processor.formattingReader.getNodesFormatting(newNodes);
        if (newNodesFormatting.entries.some(entry => entry.formatting.isBlock))
            selectionWorkspace.extend.outsideInlineParents();

        const { nodesBefore, nodesAfter } = this.extractBeforeAndAfterNodes(selectionWorkspace);
        const nodesBeforeOps = operationsBuilder.injectNodes(nodesBefore);
        const newNodesOps = operationsBuilder.injectNodes(newNodes);
        const nodesAfterOps = operationsBuilder.injectNodes(nodesAfter);
        const transaction = transactionBuilder
            .appendInjections([...nodesBeforeOps, ...newNodesOps, ...nodesAfterOps])
            .computeDeferredSelection(newNodesOps, DeferredSelectionType.AFTER_FRAGMENT)
            .appendRemovals(operationsBuilder.removeSelected());
        console.log(transaction);
    }

    public handleDeletion() {
        const selectionWorkspace = new SelectionWorkspace(this.core);
        if (selectionWorkspace.selection.commonAncestor.isTextNode)
            this.deleteSelectedText();
        else
            this.deleteSelectedContent();
    }

    public deleteSelectedText() {
        const selectionWorkspace = new SelectionWorkspace(this.core);
        const operationsBuilder = new OperationsBuilder(selectionWorkspace);
        const { offset: { start: offset }, path } = selectionWorkspace.selection.commonAncestor;

        this.core.transactions
            .builder(selectionWorkspace)
            .setDeferredSelection({ type: 'caret', path, offset })
            .appendRemovals(operationsBuilder.removeSelected());
    }

    public deleteSelectedContent() {
        const selectionWorkspace = new SelectionWorkspace(this.core);
        const operationsBuilder = new OperationsBuilder(selectionWorkspace);

        const { nodesBefore, nodesAfter } = this.extractBeforeAndAfterNodes(selectionWorkspace);
        const nodesBeforeOps = operationsBuilder.injectNodes(nodesBefore);
        const nodesAfterOps = operationsBuilder.injectNodes(nodesAfter);

        this.core.transactions
            .builder(selectionWorkspace)
            .appendInjections([...nodesBeforeOps, ...nodesAfterOps])
            .computeDeferredSelection(nodesBeforeOps, DeferredSelectionType.AFTER_FRAGMENT)
            .appendRemovals(operationsBuilder.removeSelected());
    }

    private extractBeforeAndAfterNodes(selectionWorkspace: SelectionWorkspace): {
        nodesBefore: Node[],
        nodesAfter: Node[]
    } {
        return {
            nodesBefore: selectionWorkspace.cloneFragment.selectedPart(AffectedNodesPart.BEFORE).nodes,
            nodesAfter: selectionWorkspace.cloneFragment.selectedPart(AffectedNodesPart.AFTER).nodes,
        };
    }

    private fillEmptyFormattingNode(node: Node, containerProperties: ContainerProperties): Node {
        let currentContainer = node;
        while (containerProperties.childContainer) {
            const { tagName, attributes, styles, classes } = containerProperties.childContainer;
            const childContainer = this.processor.htmlBuilder.createElement(tagName, {
                ...attributes,
                styles,
                classes,
            });
            currentContainer.appendChild(childContainer);
            containerProperties = containerProperties.childContainer;
        }
        currentContainer.appendChild(document.createTextNode(''));
        return node;
    }

    private moveCursorFromTextEdge(selectionWorkspace: SelectionWorkspace): void {
        const { commonAncestor } = selectionWorkspace.selection;
        const { parentNode } = commonAncestor.node;

        if (commonAncestor.isTextNode && (commonAncestor.offset.end === 0 || commonAncestor.offset.start === commonAncestor.node.textContent?.length)) {
            const { position } = commonAncestor;
            let offset = (commonAncestor.offset.end === 0)
                ? { start: position, end: position }
                : { start: position + 1, end: position + 1 };
            selectionWorkspace.selection.updateAllSelectionPoints({ node: parentNode!, offset });
        }
    }

}

export default CommandHandler;