export type ContainerProps = {
    name: string;
    icon: string;
    tag: string;
    isBlock: boolean;
    classes?: string[];
    attributes?: { [key: string]: string };
    styles?: { [key: string]: string };
    content?: string;
    groups?: string[];
    replaceContent?: boolean;
    requiresModal?: boolean;
};