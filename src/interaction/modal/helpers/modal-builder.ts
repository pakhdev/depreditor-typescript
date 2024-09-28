import ModalSchema from '../interfaces/modal-schema.interface.ts';
import StructureSchema
    from '../../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import Modal from '../modal.ts';
import HtmlBuilderPort from '../../../processor/ports/html-builder.port.ts';
import Processor from '../../../processor/processor.ts';

class ModalBuilder {
    public static build(modal: Modal, processor: Processor, htmlBuilder: HtmlBuilderPort, schema: ModalSchema): HTMLElement {
        return htmlBuilder.createStructure({
            tagName: 'div',
            attributes: {
                classes: ['depreditor-popup-container'],
                onmousedown: () => modal.closeModal(),
            },
            children: [
                {
                    tagName: 'div',
                    attributes: {
                        classes: ['depreditor-popup'],
                        onmousedown: (event) => event.stopPropagation(),
                    },
                    children: [
                        this.createHeaderStructure(schema.headerText),
                        schema.content,
                        this.createFooterStructure(modal, processor, schema),
                    ],
                },
            ],
        });
    }

    private static createHeaderStructure(headerText: string): StructureSchema {
        return {
            tagName: 'div',
            attributes: {
                classes: ['depreditor-popup__title'],
                textContent: headerText,
            },
        };
    }

    private static createFooterStructure(modal: Modal, processor: Processor, schema: ModalSchema): StructureSchema {
        const footerChildren: StructureSchema[] = [
            this.createButtonStructure(
                schema.cancelButton?.text || 'Cancelar',
                ['button-danger', 'button'],
                schema.cancelButton?.action || ((modal: Modal) => modal.closeModal()),
                modal,
                processor,
            ),
        ];

        if (schema.actionButton) {
            footerChildren.push(
                this.createButtonStructure(
                    schema.actionButton.text,
                    ['button-success', 'button'],
                    schema.actionButton.action,
                    modal,
                    processor,
                ),
            );
        }

        return {
            tagName: 'div',
            attributes: {
                classes: ['depreditor-popup__buttons-container'],
            },
            children: footerChildren,
        };
    }

    private static createButtonStructure(
        text: string,
        classes: string[],
        onClick: (modal: Modal, processor: Processor) => void,
        modal: Modal,
        processor: Processor,
    ): StructureSchema {
        return {
            tagName: 'button',
            attributes: {
                classes,
                textContent: text,
                onmousedown: (e) => {
                    e.stopPropagation();
                    onClick(modal, processor);
                },
            },
        };
    }
}

export default ModalBuilder;