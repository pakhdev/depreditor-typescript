import Attributes from './attributes.interface.ts';

interface StructureSchema {
    tagName: string;
    attributes: Attributes;
    children?: StructureSchema[];
}

export default StructureSchema;