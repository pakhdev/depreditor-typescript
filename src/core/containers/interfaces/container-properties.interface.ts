import { Attributes, Classes, Styles } from './index.ts';
import ContainerType from '../enums/container-type.enum.ts';

interface ContainerProperties {
    tagName: string;
    types: ContainerType[];
    classes?: Classes;
    attributes?: Attributes;
    styles?: Styles;
    isBlock?: boolean;
    keepIfEmpty?: boolean;
    mergeable?: boolean;
    childContainer?: ContainerProperties;
}

export default ContainerProperties;