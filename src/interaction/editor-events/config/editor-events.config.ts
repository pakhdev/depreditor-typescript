import EditorEventConfig from '../interfaces/editor-event-config.interface.ts';
import backspace from '../handlers/backspace.ts';
import containersConfig from '../../../core/containers/config.ts';
import cut from '../handlers/cut.ts';
import externalDrop from '../handlers/external-drop.ts';
import internalDrop from '../handlers/internal-drop.ts';
import newLine from '../handlers/new-line.ts';
import paste from '../handlers/paste.ts';
import remove from '../handlers/remove.ts';
import removeIfEmpty from '../interception/interceptors/remove-if-empty.ts';
import skipElement from '../interception/interceptors/skip-element.ts';
import splitAndClone from '../interception/interceptors/split-and-clone.ts';
import write from '../handlers/write.ts';
import {
    CODE_CONTAINER_INDENT_INTERCEPT,
    REMOVE_IF_EMPTY_INTERCEPT,
} from '../interception/constants/interception-constants.ts';

const editorEventsConfig: EditorEventConfig[] = [
    { hooks: ['writing'], method: write },
    {
        hooks: ['backspace'],
        method: backspace,
        intercept: [REMOVE_IF_EMPTY_INTERCEPT],
    },
    {
        hooks: ['cut'],
        method:
        cut,
        intercept: [REMOVE_IF_EMPTY_INTERCEPT],
    },
    {
        hooks: ['delete'],
        method:
        remove,
        intercept: [REMOVE_IF_EMPTY_INTERCEPT],
    },
    {
        hooks: ['paste'],
        method: paste,
        intercept: [CODE_CONTAINER_INDENT_INTERCEPT],
    },
    {
        hooks: ['externalDrop'],
        method: externalDrop,
        intercept: [CODE_CONTAINER_INDENT_INTERCEPT],
    },
    {
        hooks: ['internalDrop'],
        method: internalDrop,
        intercept: [CODE_CONTAINER_INDENT_INTERCEPT],
    },
    {
        hooks: ['enter'],
        method: newLine,
        intercept: [
            {
                containers: [containersConfig.li],
                interceptors: [removeIfEmpty, splitAndClone],
            },
            {
                containers: [containersConfig.link],
                interceptors: [skipElement],
            },
            CODE_CONTAINER_INDENT_INTERCEPT,
        ],
    },
];

export default editorEventsConfig;