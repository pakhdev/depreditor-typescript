import { Attributes } from '../../../../core/containers/interfaces';

interface StructureSchema {
    tagName: string;
    attributes?: Attributes;
    children?: StructureSchema[];
}

export default StructureSchema;