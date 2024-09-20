import Processor from '../../../processor/processor.ts';
import HookHandler from '../../../core/event-hooks/interfaces/hook-handler.interface.ts';

const cut: HookHandler = (event?: Event, processor?: Processor): void => {
    if (!event || !processor)
        throw new Error('Cut: El evento o el procesador no están definidos');

    const e = event as ClipboardEvent;
    e.preventDefault();

    if (processor.selectionWorkspace.isNothingSelected)
        return;

    addSelectionToClipboard(e);
    processor.commandHandler.handleText(null);
};

const addSelectionToClipboard = (e: ClipboardEvent): void => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString();
    const selectedHtml = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneContents() : null;

    let htmlContent = '';
    if (selectedHtml) {
        const div = document.createElement('div');
        div.appendChild(selectedHtml);
        htmlContent = div.innerHTML;
    }

    if (e.clipboardData) {
        e.clipboardData.setData('text/plain', selectedText);
        if (htmlContent) {
            e.clipboardData.setData('text/html', htmlContent);
        }
    }
};

export default cut;