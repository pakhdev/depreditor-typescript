import HookHandler from './interfaces/hook-handler.interface.ts';

class EventHooks {
    private readonly hooks: { [key: string]: HookHandler[] };
    private domChangeObserver: MutationObserver | null = null;
    private isDragDetected = false;
    private waitingForMouseUp = false;
    private waitingForSelectionChange = false;

    constructor(private readonly editableDiv: HTMLDivElement) {
        this.hooks = {
            'backspace': [],
            'cut': [],
            'delete': [],
            'destroy': [],
            'dragStart': [],
            'enter': [],
            'externalDrop': [],
            'internalDrop': [],
            'paste': [],
            'redo': [],
            'selectionChange': [],
            'undo': [],
            'userNavigation': [],
            'writing': [],
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

    public executeHooks(eventName: string, event?: Event): void {
        if (this.hooks[eventName]) this.hooks[eventName].forEach(handler => handler(event));
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
        this.editableDiv.addEventListener('focus', () => {
            this.waitingForSelectionChange = true;
        });

        // FIX para problemas en la detección precisa de selección en el editor
        // Los listeners 'selectionchange' y 'mouseup' están asignados al objeto document
        // Esto se hace en caso de que el usuario suelte el botón del ratón fuera del área del editor
        // Se requieren ambos eventos para ejecutar el hook 'userNavigation', porque en el caso
        // de hacer clic dentro de una selección existente, el evento 'mouseup' solo no es suficiente.
        this.editableDiv.addEventListener('mousedown', (event) => {
            // Inicia el seguimiento de eventos al detectar un clic con el botón izquierdo (button === 0)
            if (event.button === 0) {
                this.waitingForMouseUp = true;
                this.waitingForSelectionChange = true;
            }
        });

        document.addEventListener('selectionchange', (event) => {
            // Detecta cambios en la selección; si 'mouseup' ya ocurrió, ejecuta el hook
            if (this.waitingForSelectionChange) {
                if (!this.waitingForMouseUp)
                    this.executeHooks('userNavigation', event);
                this.waitingForSelectionChange = false;
            }
        });

        document.addEventListener('mouseup', (event) => {
            // Al soltar el botón del ratón, si 'selectionchange' ya ocurrió, ejecuta el hook
            if (this.waitingForMouseUp) {
                if (!this.waitingForSelectionChange)
                    this.executeHooks('userNavigation', event);
                this.waitingForMouseUp = false;
            }
        });
        // FINAL del FIX

        this.editableDiv.addEventListener('dragstart', (event) => {
            this.executeHooks('dragStart', event);
        });
        this.editableDiv.addEventListener('drop', (event) => {
            if (this.isDragDetected) this.executeHooks('internalDrop', event);
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

}

export default EventHooks;