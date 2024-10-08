import HookHandler from '../../../core/event-hooks/interfaces/hook-handler.interface.ts';
import Interaction from '../../interaction.ts';
import Processor from '../../../processor/processor.ts';
import TextPreprocessor from '../helpers/text-preprocessor.ts';
import editorConfig from '../../../editor-config/editor-config.ts';

const paste: HookHandler = (event?: Event, processor?: Processor, interaction?: Interaction): void => {
    if (!event || !processor || !interaction)
        throw new Error('Paste: El evento, el procesador o la clase de interacción no están definidos');
    const e = event as ClipboardEvent;
    e.preventDefault();
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    if (clipboardData.items.length)
        return processImages(clipboardData, processor, interaction);

    let text = new TextPreprocessor(clipboardData.getData('text')).sanitize();
    processor.commandHandler.handleInsertion(
        text.containsBreakLine() ? text.getAsHtml() : text.getAsText(),
    );
};

const processImages = (clipboardData: DataTransfer, processor: Processor, interaction: Interaction): void => {
    const items = clipboardData.items;
    const files: File[] = [];
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) files.push(file);
        }
    }
    processor.imageLoader.load(files).then(images => {
        if (checkImagesSize(images)) {
            interaction.modal.openConfirmation({
                headerText: 'Imagen grande',
                modalText: 'Al menos una de las imágenes que intentas pegar es demasiado grande. ¿Quieres habilitar la' +
                    ' vista ampliada?',
                actionButtonText: 'Sí',
                actionButtonFunction: insertImages(processor, images),
                cancelButtonText: 'No',
                cancelButtonFunction: insertImages(processor, images),
            });
        } else {
            insertImages(processor, images)(false);
        }
    });
};

const checkImagesSize = (images: HTMLImageElement[]): boolean => {
    return images.some(image =>
        image.width > editorConfig.images.maxInitialImageWidth + editorConfig.images.minResolutionDifference
        || image.height > editorConfig.images.maxInitialImageHeight + editorConfig.images.minResolutionDifference,
    );
};

const insertImages = (processor: Processor, images: HTMLImageElement[]) => {
    return (confirmation?: boolean) => {
        const adjustedImages = processor.imageBuilder.create(images, confirmation ?? false);
        processor.commandHandler.insertNodes(adjustedImages);
    };
};

export default paste;