import Processor from '../../../processor/processor.ts';
import HookHandler from '../../../core/event-hooks/interfaces/hook-handler.interface.ts';
import TextPreprocessor from '../helpers/text-preprocessor.ts';

const paste: HookHandler = (event?: Event, processor?: Processor): void => {
    if (!event || !processor)
        throw new Error('Paste: El evento o el procesador no están definidos');
    const e = event as ClipboardEvent;
    e.preventDefault();
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    if (processImages(clipboardData)) return;

    let text = new TextPreprocessor(clipboardData.getData('text')).sanitize();
    if (text.containsBreakLine())
        processor.commandHandler.insertNodes(text.getAsHtml());
    else
        processor.commandHandler.handleText(text.getAsText());
};

// TODO: Implementar la inserción de imágenes
const processImages = (clipboardData: DataTransfer): boolean => {
    const items = clipboardData.items;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
                console.log('Insertar:', file);
            }
            return true;
        }
    }
    return false;
};

export default paste;