import ModalSchema from '../interfaces/modal-schema.interface.ts';
import StructureSchema
    from '../../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import Modal from '../modal.ts';
import HtmlBuilderPort from '../../../processor/ports/html-builder.port.ts';

class ModalBuilder {
    public static build(modal: Modal, htmlBuilder: HtmlBuilderPort, schema: ModalSchema): HTMLElement {
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
                        this.createFooterStructure(modal, schema),
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

    private static createFooterStructure(modal: Modal, schema: ModalSchema): StructureSchema {
        const footerChildren: StructureSchema[] = [
            this.createButtonStructure('Cancelar', ['button-danger', 'button'], () => modal.closeModal()),
        ];

        if (schema.actionButtonText) {
            footerChildren.push(
                this.createButtonStructure(schema.actionButtonText, ['button-success', 'button'], () => {
                    // TODO: Create action logic
                }),
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
        onClick: (e: Event) => void,
    ): StructureSchema {
        return {
            tagName: 'button',
            attributes: {
                classes,
                textContent: text,
                onmousedown: (e) => {
                    e.stopPropagation();
                    onClick(e);
                },
            },
        };
    }
}

export default ModalBuilder;