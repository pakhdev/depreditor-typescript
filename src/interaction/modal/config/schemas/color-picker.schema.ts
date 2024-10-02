import ContainerProperties from '../../../../core/containers/interfaces/container-properties.interface.ts';
import Modal from '../../modal.ts';
import ModalSchema from '../../interfaces/modal-schema.interface.ts';
import Processor from '../../../../processor/processor.ts';
import StructureSchema
    from '../../../../processor/utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';
import ModalSchemaProvider from '../../interfaces/modal-schema-provider.interface.ts';

class ColorPickerModal implements ModalSchemaProvider {
    private colors: string[] = [
        '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
        '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
        '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#C9DAE1', '#C7D1D9', '#CFE2F3', '#D9D2E9', '#EAD1DC',
        '#CC8566', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#AEDDFF', '#EBD3E4',
        '#CC4C24', '#E06666', '#F6B26B',
    ];

    constructor(private processor: Processor, private modal: Modal) {}

    public getSchema(type: 'text' | 'background'): ModalSchema {
        const headerText = this.getHeaderText(type);
        const containerProperties = this.getContainerProperties(type);
        const customProperty = this.getCustomProperty(type);

        return {
            headerText,
            content: this.createContent(containerProperties, customProperty),
            formattingContainerProperties: containerProperties,
        };
    }

    private getHeaderText(type: 'text' | 'background'): string {
        return `Asignar color ${ type === 'text' ? 'de texto' : 'de fondo' }`;
    }

    private getContainerProperties(type: 'text' | 'background'): ContainerProperties {
        return type === 'text'
            ? containersConfig.spanTextColor
            : containersConfig.spanTextBackgroundColor;
    }

    private getCustomProperty(type: 'text' | 'background'): string {
        return type === 'text' ? 'color' : 'backgroundColor';
    }

    private createContent(containerProperties: ContainerProperties, customProperty: string): StructureSchema {
        return {
            tagName: 'div',
            attributes: {
                class: 'depreditor-popup__colors-container',
            },
            children: this.colors.map(color => this.createColorBlock(color, containerProperties, customProperty)),
        };
    }

    private createColorBlock(color: string, containerProperties: ContainerProperties, customProperty: string): StructureSchema {
        return {
            tagName: 'div',
            attributes: {
                style: `background-color: ${ color }`,
                onmousedown: () => {
                    const { tagName } = containerProperties;
                    const wrapper = this.processor.htmlBuilder.createElement(tagName, {
                        styles: {
                            [customProperty]: color,
                        },
                    });
                    this.processor.commandHandler.insertNodes([wrapper]);
                    this.modal.closeModal();
                },
            },
        };
    }
}

export default ColorPickerModal;
