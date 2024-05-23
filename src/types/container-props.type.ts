import { FormattingName } from './formatting-name.type.ts';

export type ContainerProps = {
    name: FormattingName;
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