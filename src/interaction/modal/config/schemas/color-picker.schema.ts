import ModalSchema from '../../interfaces/modal-schema.interface.ts';
import ContainerProperties from '../../../../core/containers/interfaces/container-properties.interface.ts';
import containersConfig from '../../../../core/containers/config.ts';
import Processor from '../../../../processor/processor.ts';

const colors = [
    '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
    '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
    '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#C9DAE1', '#C7D1D9', '#CFE2F3', '#D9D2E9', '#EAD1DC',
    '#CC8566', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#AEDDFF', '#D9D2E9', '#EBD3E4',
    '#CC4C24', '#E06666', '#F6B26B', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#AEDDFF', '#D9D2E9', '#EBD3E4',
];

const colorPickerSchema = (processor: Processor, type: 'text' | 'background'): ModalSchema => {
    const name = type === 'text'
        ? 'textColor'
        : 'backgroundColor';
    const headerTextPart = type === 'text'
        ? 'de texto'
        : 'de fondo';
    const containerProperties: ContainerProperties = type === 'text'
        ? containersConfig.spanTextColor
        : containersConfig.spanBackgroundColor;
    const customProperty = type === 'text'
        ? 'color'
        : 'backgroundColor';

    return {
        name,
        headerText: `Asignar color ${ headerTextPart }`,
        content: {
            tagName: 'div',
            attributes: {
                class: 'depreditor-popup__colors-container',
            },
            children: colors.map(color => ({
                tagName: 'div',
                attributes: {
                    style: `background-color: ${ color }`,
                    onmousedown: () => processor.commandHandler.handleElement({
                        ...containerProperties,
                        styles: {
                            [customProperty]: color,
                        },
                    }),
                },
            })),
        },
        formattingContainerProperties: containerProperties,
    };
};

export default colorPickerSchema;