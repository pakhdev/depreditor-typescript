import Core from '../core/core.ts';
import EditorEvents from './editor-events/editor-events.ts';

class Interaction {

    public editorEvents: EditorEvents

    constructor(
        private readonly core: Core,
        private readonly toolbarContainer: HTMLElement
    ) {
        this.editorEvents = new EditorEvents(core, toolbarContainer);
    }
}

export default Interaction;