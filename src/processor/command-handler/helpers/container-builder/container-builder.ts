import ElementCreationProperties from '../../interfaces/element-creation-properties.interface.ts';
import HtmlElementBuilder from '../../../utilities/html-element-builder/html-element-builder.ts';
import ImageBuilder from './helpers/image-builder.ts';
import ImageCreationProperties from '../../interfaces/image-creation-properties.interface.ts';
import TableBuilder from './helpers/table-builder.ts';
import TableCreationProperties from '../../interfaces/table-creation-properties.interface.ts';

class ContainerBuilder {
    public static async create(elementProperties: ElementCreationProperties): Promise<HTMLElement | undefined> {
        switch (elementProperties.tagName) {
            case 'table':
                const {
                    rows,
                    cols,
                } = (elementProperties as TableCreationProperties).creationParams;
                return TableBuilder.create(rows, cols);
            case 'img':
                const {
                    fileInput,
                    userWantsLargeImage,
                    imageLimits,
                } = (elementProperties as ImageCreationProperties).creationParams;
                return await new ImageBuilder(imageLimits).create(fileInput, userWantsLargeImage);
            default:
                const { tagName, attributes, styles, classes } = elementProperties;
                return HtmlElementBuilder.createElement(tagName, { ...attributes, styles, classes });
        }
    }
}

export default ContainerBuilder;