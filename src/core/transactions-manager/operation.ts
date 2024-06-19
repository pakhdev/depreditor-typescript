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

    }

    private removeElement(): void {

    }

    private injectText(): void {

    }

    private removeText(): void {

    }

}