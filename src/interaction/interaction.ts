import Core from '../core/core.ts';
import EditorEvents from './editor-events/editor-events.ts';
import Toolbar from './toolbar/toolbar.ts';
import Processor from '../processor/processor.ts';

class Interaction {

    private readonly editorEvents: EditorEvents;
    private readonly toolbar: Toolbar;


    constructor(
        private readonly core: Core,
        private readonly processor: Processor,
        private readonly toolbarContainer: HTMLElement
    ) {
        this.editorEvents = new EditorEvents(core);
        this.toolbar = new Toolbar(core, processor, toolbarContainer);
    }
}

export default Interaction;