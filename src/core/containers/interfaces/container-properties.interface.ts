export interface ContainerProperties {
    tagName: string;
    isBlock: boolean;
    classes?: string[];
    attributes?: { [key: string]: string };
    styles?: { [key: string]: string };
    keepIfEmpty?: boolean;
    mergeable?: boolean;
}
