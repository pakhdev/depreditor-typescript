import Processor from '../../../../processor/processor.ts';

const splitAndClone = (processor: Processor, element: Node): boolean => {
    const { selectionWorkspace: currentWorkspace } = processor.selectionWorkspace;
    currentWorkspace.extend.coverNode(element);
    processor.commandHandler.deleteSelectedContent();
    return true;
};

export default splitAndClone;