import Core from './core/core.ts';
import Processor from './processor/processor.ts';
import Interaction from './interaction/interaction.ts';

export class EditorInitializer {

    private readonly core: Core;
    private readonly processor: Processor;
    private readonly interaction: Interaction;

    constructor(
        public readonly editableDiv: HTMLDivElement,
        public readonly toolbarContainer: HTMLElement,
    ) {
        this.normalizeCode();
        this.core = new Core(this.editableDiv);
        this.processor = new Processor(this.core);
        this.interaction = new Interaction(this.core, this.processor, this.toolbarContainer);
    }

    private normalizeCode(): EditorInitializer {
        this.editableDiv.innerHTML = this.editableDiv.innerHTML
            .replace(/\n/g, '')
            .replace(/\s+/g, ' ')
            .replace(/>\s/g, '>')
            .replace(/\s</g, '<');
        return this;
    }

}