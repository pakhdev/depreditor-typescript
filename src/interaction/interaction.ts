import Core from '../core/core.ts';
import EditorEvents from './editor-events/editor-events.ts';
import Toolbar from './toolbar/toolbar.ts';
import Processor from '../processor/processor.ts';
import Modal from './modal/modal.ts';

class Interaction {

    public readonly editorEvents: EditorEvents;
    public readonly modal: Modal;
    public readonly toolbar: Toolbar;

    constructor(
        private readonly core: Core,
        private readonly processor: Processor,
        private readonly toolbarContainer: HTMLElement,
    ) {
        this.editorEvents = new EditorEvents(this.core, this.processor, this);
        this.modal = new Modal(this.processor, this.core.editableDiv);
        this.toolbar = new Toolbar(this.core, this.processor, this.modal, this.toolbarContainer);
    }
}

export default Interaction;