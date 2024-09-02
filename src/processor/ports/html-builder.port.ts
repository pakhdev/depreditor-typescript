import { Attributes } from '../../core/containers/interfaces';
import StructureSchema from '../utilities/html-element-builder/interfaces/structure-schema.interface.ts';
import HtmlElementBuilder from '../utilities/html-element-builder/html-element-builder.ts';

class HtmlBuilderPort {

    public static createElement(tagName: string, attributes: Attributes): HTMLElement {
        return HtmlElementBuilder.createElement(tagName, attributes);
    }

    public static createStructure(schema: StructureSchema): HTMLElement {
        return HtmlElementBuilder.createStructure(schema);
    }
}

export default HtmlBuilderPort;