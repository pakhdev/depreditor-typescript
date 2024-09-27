import ElementCreationProperties from '../../interfaces/element-creation-properties.interface.ts';
import HtmlElementBuilder from '../../../utilities/html-element-builder/html-element-builder.ts';
import ImageBuilder from './helpers/image-builder.ts';
import ImageCreationProperties from '../../interfaces/image-creation-properties.interface.ts';
import TableBuilder from './helpers/table-builder.ts';
import TableCreationProperties from '../../interfaces/table-creation-properties.interface.ts';

class ContainerBuilder {
    public static create(elementProperties: ElementCreationProperties): HTMLElement | HTMLElement[] | undefined {
        switch (elementProperties.tagName) {
            case 'table':
                const {
                    rows,
                    cols,
                } = (elementProperties as TableCreationProperties).creationParams;
                return TableBuilder.create(rows, cols);
            case 'img':
                const { images, userWantsLargeImage } = (elementProperties as ImageCreationProperties).creationParams;
                return new ImageBuilder().create(images, userWantsLargeImage);
            default:
                const { tagName, attributes, styles, classes } = elementProperties;
                return HtmlElementBuilder.createElement(tagName, { ...attributes, styles, classes });
        }
    }
}

export default ContainerBuilder;