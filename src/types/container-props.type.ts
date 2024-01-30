export type ContainerProps = {
    tag: string;
    classes?: string[];
    attributes?: { [key: string]: string };
    styles?: { [key: string]: string };
    content?: string;
};