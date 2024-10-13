import ActionResolver from './helpers/action-resolver.ts';
import ActionTypes from './enums/action-types.enum.ts';
import AffectedNodesPart from '../../core/selection/enums/affected-nodes-part.enum.ts';
import Core from '../../core/core.ts';
import OperationsBuilder from '../utilities/operations-builder/operations-builder.ts';
import Processor from '../processor.ts';
import SelectionAdjuster from './helpers/selection-adjuster.ts';
import SelectionWorkspace from '../selection-workspace/selection-workspace.ts';
import TransactionBuilder from '../../core/transactions-manager/helpers/transaction-builder.ts';
import DeferredSelectionType from '../../core/transactions-manager/enums/deferred-selection-type.enum.ts';

class CommandHandler {

    constructor(
        private readonly core: Core,
        private readonly processor: Processor,
    ) {}

    public handleInsertion(input: Node[] | string, transactionBuilder?: TransactionBuilder) {
        if (!input.length) return;

        if (typeof input === 'string' || (input.length === 1 && input[0].nodeType === Node.TEXT_NODE)) {
            const text = typeof input === 'string' ? input : input[0].textContent;
            if (text) this.insertText(text, transactionBuilder);
        } else {
            (input.length === 1)
                ? this.handleElement(input[0], transactionBuilder)
                : this.insertNodes(input, transactionBuilder);
        }
    }

    public handleElement(node: Node, transactionBuilder?: TransactionBuilder) {
        const selectionWorkspace = new SelectionWorkspace(this.core);
        const operationsBuilder = new OperationsBuilder(selectionWorkspace);
        const containerProperties = this.core.containers.identify(node);
        const action = containerProperties
            ? ActionResolver.resolveContainerAction(selectionWorkspace, containerProperties)
            : ActionTypes.INSERT;
        if (containerProperties)
            SelectionAdjuster.adjust(selectionWorkspace, containerProperties, action);
        else
            return this.insertNodes([node], transactionBuilder);
        const selectedPart = selectionWorkspace.cloneFragment.selectedPart(AffectedNodesPart.WITHIN).nodes;

        if (!transactionBuilder)
            transactionBuilder = this.core.transactions.builder(selectionWorkspace);

        let newNodes: Node[] = [];
        if (action === ActionTypes.INSERT)
            newNodes = [node];
        else if (action === ActionTypes.UNWRAP)
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

    public insertText(text: string, transactionBuilder?: TransactionBuilder) {
        const selectionWorkspace = new SelectionWorkspace(this.core);
        const operationsBuilder = new OperationsBuilder(selectionWorkspace);
        const isAncestorTextNode = selectionWorkspace.selection.commonAncestor.isTextNode;

        if (!transactionBuilder)
            transactionBuilder = this.core.transactions.builder(selectionWorkspace);

        if (!isAncestorTextNode)
            this.insertNodes([document.createTextNode(text)], transactionBuilder);

        const textInjectionOp = operationsBuilder.injectText(text);

        const transaction = transactionBuilder
            .appendInjections(textInjectionOp)
            .computeDeferredSelection(textInjectionOp, DeferredSelectionType.AFTER_FRAGMENT)
            .appendRemovals(operationsBuilder.removeSelected())
            .build();
        console.log(transaction);
    }

    public insertNodes(newNodes: Node[], transactionBuilder?: TransactionBuilder) {
        const selectionWorkspace = new SelectionWorkspace(this.core);
        const operationsBuilder = new OperationsBuilder(selectionWorkspace);
        const insertionZoneFormatting = this.processor.formattingReader.getInsertionPointFormatting();
        let newNodesFormatting = this.processor.formattingReader.getNodesFormatting(newNodes);
        if (!transactionBuilder)
            transactionBuilder = this.core.transactions.builder(selectionWorkspace);

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

        transactionBuilder
            .appendInjections([...nodesBeforeOps, ...newNodesOps, ...nodesAfterOps])
            .computeDeferredSelection(newNodesOps, DeferredSelectionType.AFTER_FRAGMENT)
            .appendRemovals(operationsBuilder.removeSelected());
    }

    public handleDeletion() {
        const selectionWorkspace = new SelectionWorkspace(this.core);
        if (selectionWorkspace.selection.commonAncestor.isTextNode)
            this.deleteSelectedText();
        else
            this.deleteSelectedContent();
    }

    private deleteSelectedText() {
        const selectionWorkspace = new SelectionWorkspace(this.core);
        const operationsBuilder = new OperationsBuilder(selectionWorkspace);
        const { offset: { start: offset }, path } = selectionWorkspace.selection.commonAncestor;

        this.core.transactions
            .builder(selectionWorkspace)
            .setDeferredSelection({ type: 'caret', path, offset })
            .appendRemovals(operationsBuilder.removeSelected());
    }

    private deleteSelectedContent() {
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

}

export default CommandHandler;