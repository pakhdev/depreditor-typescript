import ModalSchemaProvider from '../../interfaces/modal-schema-provider.interface.ts';
import Modal from '../../modal.ts';
import ModalSchema from '../../interfaces/modal-schema.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';
import StructureSchema
    from '../../../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import ConfirmationParams from '../../interfaces/confirmation-params.interface.ts';

class ConfirmationModal implements ModalSchemaProvider {

    private headerText: string = '';
    private modalText: string = '';
    private actionButtonText: string = 'Aceptar';
    private cancelButtonText: string = 'Cancelar';
    private actionButtonFunction: (confirmation?: boolean) => void = () => {};
    private cancelButtonFunction: (confirmation?: boolean) => void = () => {};

    constructor() {}

    public getSchema(): ModalSchema {
        return {
            headerText: this.headerText,
            formattingContainerProperties: containersConfig.image,
            content: this.createContent(),
            actionButton: this.createButtonParams(
                this.actionButtonText,
                this.actionButtonFunction,
                true),
            cancelButton: this.createButtonParams(
                this.cancelButtonText,
                this.cancelButtonFunction,
                false),
        };
    }

    public setParameters(params: ConfirmationParams): ConfirmationModal {
        this.headerText = params.headerText;
        this.modalText = params.modalText;
        if (params.actionButtonText) this.actionButtonText = params.actionButtonText;
        this.actionButtonFunction = params.actionButtonFunction;
        if (params.cancelButtonText) this.cancelButtonText = params.cancelButtonText;
        if (params.cancelButtonFunction) this.cancelButtonFunction = params.cancelButtonFunction;
        return this;
    }

    private createContent(): StructureSchema {
        return {
            tagName: 'div',
            attributes: {
                class: 'depreditor-popup__centering-container',
                textContent: this.modalText,
            },
        };
    }

    private createButtonParams(
        text: string,
        action: (confirmation?: boolean) => void,
        value: boolean,
    ): {
        text: string;
        action: (modal: Modal) => void;
    } {
        return {
            text, action: (modal) => {
                action(value);
                modal.closeModal();
            },
        };
    }
}

export default ConfirmationModal;