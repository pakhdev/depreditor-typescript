import { EditorInitializer } from '../editor-Initializer.ts';
import { ActionHandler } from '../actions/interfaces/action-handler.interface.ts';

export class EventHooks {
    private readonly hooks: { [key: string]: ActionHandler[] };
    private domChangeObserver: MutationObserver | null = null;
    private isDragDetected = false;

    constructor(
        private readonly depreditor: EditorInitializer,
        private readonly editableDiv: HTMLDivElement,
    ) {
        this.hooks = {
            'onEnter': [],
            'onUndo': [],
            'onRedo': [],
            'onDelete': [],
            'onBackspace': [],
            'onUserNavigation': [],
            'onPaste': [],
            'onCut': [],
            'onWriting': [],
            'onDestroy': [],
            'onDragStart': [],
            'onInternalDrop': [],
            'onExternalDrop': [],
            'afterAny': [],
        };
        this.setupEventListeners();
        this.setupInternalHooks();
    }

    private setupEventListeners(): void {
        this.editableDiv.addEventListener('paste', (event) => {
            this.executeHooks('onPaste', event);
        });
        this.editableDiv.addEventListener('cut', (event) => {
            this.executeHooks('onCut', event);
        });
        this.editableDiv.addEventListener('keydown', (event) => {
            if (
                event.key.length === 1
                && !event.ctrlKey
                && !event.metaKey
                && !event.altKey
            ) {
                this.executeHooks('onWriting', event);
            } else if (event.key === 'Enter') {
                this.executeHooks('onEnter', event);
            } else if (event.code === 'KeyZ' && event.ctrlKey) {
                this.executeHooks('onUndo', event);
            } else if (event.code === 'KeyY' && event.ctrlKey) {
                this.executeHooks('onRedo', event);
            } else if (event.code === 'Delete') {
                this.executeHooks('onDelete', event);
            } else if (event.code === 'Backspace') {
                this.executeHooks('onBackspace', event);
            }
        });
        this.editableDiv.addEventListener('keyup', (event) => {
            if (event.code.startsWith('Arrow')) {
                this.executeHooks('onUserNavigation', event);
            }
        });
        this.editableDiv.addEventListener('mouseup', (event) => {
            this.executeHooks('onUserNavigation', event);
        });
        this.editableDiv.addEventListener('focus', (event) => {
            this.executeHooks('onUserNavigation', event);
        });
        this.editableDiv.addEventListener('dragstart', (event) => {
            this.executeHooks('onDragStart', event);
        });
        this.editableDiv.addEventListener('drop', (event) => {
            if (this.isDragDetected) this.executeHooks('onInternalDrop', event);
            else this.executeHooks('onExternalDrop', event);
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
                    this.executeHooks('onDestroy');
            });
        });
        this.domChangeObserver.observe(this.editableDiv.parentNode!, { childList: true });
    }

    private setupInternalHooks(): void {
        this.addHooks(['onDestroy'], () => {
            this.unsubscribeAll();
            this.domChangeObserver?.disconnect();
        });
        this.addHooks(['onDragStart'], () => this.isDragDetected = true);
        this.addHooks(['onUserNavigation'], () => this.isDragDetected = false);
    }

    private executeHooks(eventName: string, event?: Event): void {
        if (this.hooks[eventName]) this.hooks[eventName].forEach(hook => hook(this.depreditor.selectedNodes, event));
        this.hooks.afterAny.forEach(hook => hook(this.depreditor.selectedNodes, event));
    }

    public addHooks(eventNames: string[], method: ActionHandler): void {
        eventNames.forEach(eventName => {
            if (this.hooks[eventName]) {
                this.hooks[eventName].push(method);
            }
        });
    }

    public removeHook(eventName: string, hook: () => void): void {
        const hooks = this.hooks[eventName];
        if (hooks) {
            this.hooks[eventName] = hooks.filter(existingHook => existingHook !== hook);
        }
    }

    public unsubscribeAll(): void {
        Object.keys(this.hooks).forEach(eventName => {
            this.hooks[eventName] = [];
        });
    }
}
