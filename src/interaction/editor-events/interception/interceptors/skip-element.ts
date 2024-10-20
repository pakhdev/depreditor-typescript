import Processor from '../../../../processor/processor.ts';
import HandlingContext from '../../../../processor/command-handler/interfaces/handling-context.interface.ts';

const skipElement = (processor: Processor, element: Node, handlingContext: HandlingContext): boolean => {
    const { selectionWorkspace: currentWorkspace } = processor.selectionWorkspace;
    const parentNode = element.parentNode;
    if (parentNode) {
        currentWorkspace.extend.selectNode(element);
        const { node, position } = currentWorkspace.selection.commonAncestor;
        currentWorkspace.selection.updateAllSelectionPoints({
            node,
            offset: { start: position + 1, end: position + 1 },
        });
        handlingContext.workspace = currentWorkspace;
    }
    return false;
};

export default skipElement;