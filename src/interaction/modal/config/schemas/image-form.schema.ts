import ImageCreationProperties
    from '../../../../processor/command-handler/interfaces/image-creation-properties.interface.ts';
import ImageLimits from '../../../../processor/command-handler/interfaces/image-limits.inteface.ts';
import Modal from '../../modal.ts';
import ModalSchema from '../../interfaces/modal-schema.interface.ts';
import Processor from '../../../../processor/processor.ts';
import StructureSchema
    from '../../../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';

const imageLimits: ImageLimits = {
    maxInitialImageWidth: 800,
    maxInitialImageHeight: 600,
    maxLargeImageWidth: 300,
    maxLargeImageHeight: 1600,
    minResolutionDifference: 1200,
};

const imageFormSchema = (processor: Processor, modal: Modal): ModalSchema => {
    return {
        name: 'imageForm',
        headerText: 'Insertar imagen',
        formattingContainerProperties: containersConfig.image,
        content: {
            tagName: 'div',
            attributes: {
                class: 'depreditor-popup__centering-container',
            },
            children: [
                toggleCheckboxStructure,
                fileInputStructure(processor, modal),
            ],
        },
        actionButton: {
            text: 'Seleccionar imágen',
            action: (modal) => {
                if (!modal.modalContainer)
                    throw new Error('No se encontró el contenedor del modal');
                const fileInput = modal.modalContainer.querySelector('input[type="file"]') as HTMLInputElement;
                if (!fileInput)
                    throw new Error('No se encontró el input de imagen');
                fileInput.click();
            },
        },
    };
};

const toggleCheckboxStructure: StructureSchema = {
    tagName: 'label',
    attributes: {
        class: 'toggle',
    },
    children: [
        {
            tagName: 'input',
            attributes: {
                type: 'checkbox',
                class: 'toggle-checkbox',
            },
        },
        {
            tagName: 'div',
            attributes: {
                class: 'toggle-switch',
            },
        },
        {
            tagName: 'span',
            attributes: {
                class: 'toggle-label',
                textContent: 'Habilitar vista ampliada',
            },
        },
    ],
};

const fileInputStructure = (processor: Processor, modal: Modal): StructureSchema => ({
    tagName: 'input',
    attributes: {
        type: 'file',
        accept: 'image/*',
        style: 'display: none',
        onchange: () => {
            processor.commandHandler.handleElement(prepareImageProperties(modal));
            modal.closeModal();
        },
    },
});

const prepareImageProperties = (modal: Modal): ImageCreationProperties => {
    if (!modal.modalContainer)
        throw new Error('No se encontró el contenedor del modal');

    const fileInput = modal.modalContainer.querySelector('input[type="file"]') as HTMLInputElement;
    const checkboxInput = modal.modalContainer.querySelector('input[type="checkbox"]') as HTMLInputElement;

    if (!fileInput || !checkboxInput)
        throw new Error('No se encontraron los inputs de imagen y/o checkbox');

    return {
        ...containersConfig.image,
        tagName: 'img',
        creationParams: {
            fileInput,
            userWantsLargeImage: checkboxInput.checked,
            imageLimits,
        },
    };
};

export default imageFormSchema;