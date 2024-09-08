import HtmlBuilderPort from '../../processor/ports/html-builder.port.ts';
import ModalBuilder from './helpers/modal-builder.ts';
import ModalSchema from './interfaces/modal-schema.interface.ts';
import Processor from '../../processor/processor.ts';
import modalSchemas from './config/modal-schemas.ts';

class Modal {

    public modalContainer: HTMLElement | undefined;
    private openedModalName: string | undefined;

    private readonly htmlBuilder: HtmlBuilderPort;
    private readonly schemas: ModalSchema[];

    constructor(
        private readonly processor: Processor,
        private readonly editableDiv: HTMLElement,
    ) {
        this.htmlBuilder = this.processor.htmlBuilder;
        this.schemas = modalSchemas(processor, this);
    }

    public openModal(schemaName: string): void {
        const schema = this.schemas.find(s => s.name === schemaName);
        if (!schema)
            throw new Error(`No se encontró el esquema de modal con nombre ${ schemaName }`);

        this.openedModalName = schemaName;
        this.modalContainer = ModalBuilder.build(this, this.processor, this.htmlBuilder, schema);
        this.insertModalIntoDOM();
    }

    private insertModalIntoDOM(): void {
        if (!this.modalContainer) return;
        this.editableDiv.parentNode!.insertBefore(this.modalContainer, this.editableDiv.nextSibling);
    }

    public closeModal(): void {
        if (!this.modalContainer) return;
        this.modalContainer.remove();
        this.modalContainer = undefined;
        this.openedModalName = undefined;
    }
}

export default Modal;