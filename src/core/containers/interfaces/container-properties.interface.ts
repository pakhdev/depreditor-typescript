import { Attributes, Classes, Styles } from './index.ts';

interface ContainerProperties {
    tagName: string;
    isBlock: boolean;
    classes?: Classes;
    attributes?: Attributes;
    styles?: Styles;
    keepIfEmpty?: boolean;
    mergeable?: boolean;
}

export default ContainerProperties;