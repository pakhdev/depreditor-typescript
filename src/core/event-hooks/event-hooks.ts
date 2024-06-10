import { HookHandler } from './interfaces/hook-handler.interface.ts';

export class EventHooks {
    private readonly hooks: { [key: string]: HookHandler[] };
    private domChangeObserver: MutationObserver | null = null;
    private isDragDetected = false;
    private isMouseButtonPressed = false;

    constructor(private readonly editableDiv: HTMLDivElement) {
        this.hooks = {
            'enter': [],
            'undo': [],
            'redo': [],
            'delete': [],
            'backspace': [],
            'userNavigation': [],
            'paste': [],
            'cut': [],
            'writing': [],
            'destroy': [],
            'dragStart': [],
            'internalDrop': [],
            'externalDrop': [],
        };
        this.setupEventListeners();
        this.setupInternalHooks();
    }

    public on(eventNames: string[], method: HookHandler): void {
        eventNames.forEach(eventName => {
            if (this.hooks[eventName]) {
                this.hooks[eventName].push(method);
            }
        });
    }

    public unsubscribeAll(): void {
        Object.keys(this.hooks).forEach(eventName => {
            this.hooks[eventName] = [];
        });
    }

    private setupEventListeners(): void {
        this.editableDiv.addEventListener('paste', (event) => {
            this.executeHooks('paste', event);
        });
        this.editableDiv.addEventListener('cut', (event) => {
            this.executeHooks('cut', event);
        });
        this.editableDiv.addEventListener('keydown', (event) => {
            if (
                event.key.length === 1
                && !event.ctrlKey
                && !event.metaKey
                && !event.altKey
            ) {
                this.executeHooks('writing', event);
            } else if (event.key === 'Enter') {
                this.executeHooks('enter', event);
            } else if (event.code === 'KeyZ' && event.ctrlKey) {
                this.executeHooks('undo', event);
            } else if (event.code === 'KeyY' && event.ctrlKey) {
                this.executeHooks('redo', event);
            } else if (event.code === 'Delete') {
                this.executeHooks('delete', event);
            } else if (event.code === 'Backspace') {
                this.executeHooks('backspace', event);
            }
        });
        this.editableDiv.addEventListener('keyup', (event) => {
            if (event.code.startsWith('Arrow')) {
                this.executeHooks('userNavigation', event);
            }
        });
        this.editableDiv.addEventListener('focus', (event) => {
            if (!this.isMouseButtonPressed)
                this.executeHooks('userNavigation', event);
        });
        this.editableDiv.addEventListener('mousedown', (event) => {
            if (event.button === 0)
                this.isMouseButtonPressed = true;
        });
        this.editableDiv.addEventListener('mouseup', (event) => {
            this.executeHooks('userNavigation', event);
            this.isMouseButtonPressed = false;
        });
        this.editableDiv.addEventListener('dragstart', (event) => {
            this.executeHooks('dragStart', event);
        });
        this.editableDiv.addEventListener('drop', (event) => {
            if (this.isDragDetected) this.executeHooks('onInternalDrop', event);
            else this.executeHooks('externalDrop', event);
        });
        // Prevención del evento Undo y Redo en el elemento body
        document.addEventListener('keydown', (e) => {
            const keyboardEvent = e as KeyboardEvent;
            if ((keyboardEvent.code === 'KeyZ' || keyboardEvent.code === 'KeyY')
                && keyboardEvent.ctrlKey && e.target === document.body) {
                e.preventDefault();
            }
        });
        // Control de la destrucción del editor
        this.domChangeObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type !== 'childList') return;
                if (Array.from(mutation.removedNodes).includes(this.editableDiv))
                    this.executeHooks('destroy');
            });
        });
        this.domChangeObserver.observe(this.editableDiv.parentNode!, { childList: true });
    }

    private setupInternalHooks(): void {
        this.on(['destroy'], () => {
            this.unsubscribeAll();
            this.domChangeObserver?.disconnect();
        });
        this.on(['dragStart'], () => this.isDragDetected = true);
        this.on(['userNavigation'], () => this.isDragDetected = false);
    }

    private executeHooks(eventName: string, event?: Event): void {
        if (this.hooks[eventName]) this.hooks[eventName].forEach(handler => handler(event));
    }

}
