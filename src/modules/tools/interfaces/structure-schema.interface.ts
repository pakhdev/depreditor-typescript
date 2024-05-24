import { Attributes } from './attributes.interface.ts';

export interface StructureSchema {
    tagName: string;
    attributes: Attributes;
    children?: StructureSchema[];
}