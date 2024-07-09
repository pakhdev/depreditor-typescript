import Core from './core/core.ts';

export class EditorInitializer {

    private core: Core;

    constructor(
        public readonly editableDiv: HTMLDivElement,
        public readonly toolbarContainer: HTMLElement,
    ) {
        this.normalizeCode();
        this.core = new Core(this.editableDiv);
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