import HtmlBuilderPort from '../../processor/ports/html-builder.port.ts';
import ModalBuilder from './helpers/modal-builder.ts';
import Processor from '../../processor/processor.ts';
import modalSchemasConfig from './config/modal-schemas.config.ts';
import ModalSchemaConfig from './interfaces/modal-schema-config.interface.ts';
import ModalSchema from './interfaces/modal-schema.interface.ts';
import ConfirmationParams from './interfaces/confirmation-params.interface.ts';
import ConfirmationSchema from './config/schemas/confirmation.schema.ts';

class Modal {

    public modalContainer: HTMLElement | undefined;
    private openedModalName: string | undefined;

    private readonly htmlBuilder: HtmlBuilderPort;
    private readonly schemasConfig: ModalSchemaConfig;

    constructor(
        private readonly processor: Processor,
        private readonly editableDiv: HTMLElement,
    ) {
        this.htmlBuilder = this.processor.htmlBuilder;
        this.schemasConfig = modalSchemasConfig(processor, this);
    }

    public openConfirmation(params: ConfirmationParams): void {
        this.build('confirmation', new ConfirmationSchema().setParameters(params).getSchema());
    }

    public openSchema(schemaName: string): void {
        const schemaEntry = this.schemasConfig[schemaName];
        if (!schemaEntry)
            throw new Error(`No se encontró el esquema de modal con nombre ${ schemaName }`);
        const schema = schemaEntry.provider.getSchema(schemaEntry.type);
        this.build(schemaName, schema);
    }

    private build(schemaName: string, schema: ModalSchema): void {
        if (this.openedModalName === schemaName) {
            this.closeModal();
            return;
        } else if (this.openedModalName) {
            this.closeModal();
        }
        this.openedModalName = schemaName;
        this.modalContainer = ModalBuilder.build(this, this.processor, this.htmlBuilder, schema);
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