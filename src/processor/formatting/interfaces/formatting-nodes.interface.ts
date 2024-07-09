import { containersConfig } from '../containers-config';

export type FormattingNodes = {
    [K in keyof typeof containersConfig]: Node;
};