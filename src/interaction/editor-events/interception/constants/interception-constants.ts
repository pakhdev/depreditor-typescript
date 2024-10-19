import containersConfig from '../../../../core/containers/config.ts';
import keepTextIndentation from '../interceptors/keep-text-indentation.ts';
import removeIfEmpty from '../interceptors/remove-if-empty.ts';

export const SPECIAL_DELETION_CONTAINERS = [
    containersConfig.li,
    containersConfig.divAlignLeft,
    containersConfig.divAlignCenter,
    containersConfig.divAlignRight,
    containersConfig.code,
];

export const CODE_CONTAINER_INDENT_INTERCEPT = {
    containers: [containersConfig.code],
    interceptors: [keepTextIndentation],
};

export const REMOVE_IF_EMPTY_INTERCEPT = {
    containers: SPECIAL_DELETION_CONTAINERS,
    interceptors: [removeIfEmpty],
};