import EditorEventInterception from './editor-event-interception.interface.ts';
import EditorEventHandler from './editor-event-handler.interface.ts';

interface EditorEventConfig {
    hooks: string[];
    method: EditorEventHandler;
    intercept?: EditorEventInterception[];
}

export default EditorEventConfig;