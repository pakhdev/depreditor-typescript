import { OperationType } from './enums/operation-type.enum.ts';
import { SelectedElement } from '../selection/helpers/selected-element.ts';

export class Operation {

    private readonly elementToInject: Node | undefined;
    private readonly textToInject: string | undefined;

    constructor(
        public readonly type: OperationType,
        public position: SelectedElement,
        injectable?: Node | string,
    ) {
        if (injectable instanceof Node)
            this.elementToInject = injectable;
        else if (typeof injectable === 'string')
            this.textToInject = injectable;
    }

    public execute(): boolean {
        switch (this.type) {
            case OperationType.ELEMENT_INJECTION:
                this.injectElement();
                break;
            case OperationType.ELEMENT_REMOVAL:
                this.removeElement();
                break;
            case OperationType.TEXT_INJECTION:
                this.injectText();
                break;
            case OperationType.TEXT_REMOVAL:
                this.removeText();
                break;
        }
    }

    public undo(): boolean {
        switch (this.type) {
            case OperationType.ELEMENT_INJECTION:
                this.removeElement();
                break;
            case OperationType.ELEMENT_REMOVAL:
                this.injectElement();
                break;
            case OperationType.TEXT_INJECTION:
                this.removeText();
                break;
            case OperationType.TEXT_REMOVAL:
                this.injectText();
                break;
        }
    }

    private injectElement(): void {
        if (!this.elementToInject)
            throw new Error('Elemento a insertar no definido');

        const parentNode = this.position.parentNode;

        if (this.position.exists) {
            parentNode.insertBefore(this.elementToInject, this.position.node);
        } else {
            const { position } = this.position;
            if (parentNode.childNodes.length !== position)
                throw new Error('Posición de inserción no válida');
            parentNode.appendChild(this.elementToInject);
        }
    }

    private removeElement(): void {
        const nodeToRemove = this.position.node;
        if (nodeToRemove.parentNode)
            nodeToRemove.parentNode.removeChild(nodeToRemove);
    }

    private injectText(): void {
        if (this.position.offset.start !== this.position.offset.end)
            throw new Error('Offset de inserción no válido');
        if (!this.textToInject)
            throw new Error('Texto a insertar no definido');
        if (this.position.node.nodeType !== Node.TEXT_NODE)
            throw new Error('No se puede eliminar texto de un nodo que no es de tipo texto');

        const currentText = this.position.node.textContent || '';
        const textBefore = currentText.slice(0, this.position.offset.start);
        const textAfter = currentText.slice(this.position.offset.start);
        this.position.node.textContent = textBefore + this.textToInject + textAfter;
    }

    private removeText(): void {
        if (this.position.offset.start === this.position.offset.end)
            throw new Error('Offset de eliminación no válido');
        if (this.position.node.nodeType !== Node.TEXT_NODE)
            throw new Error('No se puede eliminar texto de un nodo que no es de tipo texto');

        const currentText = this.position.node.textContent || '';
        const textBefore = currentText.slice(0, this.position.offset.start);
        const textAfter = currentText.slice(this.position.offset.end);
        this.position.node.textContent = textBefore + textAfter;
    }

}