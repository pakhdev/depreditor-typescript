import { ContainerProps } from '../../types/container-props.type.ts';
import { SelectionReader } from './helpers/selection-reader.ts';
import { NodeSelection } from './helpers/node-selection.ts';

/**
 * Clase para gestionar la selección de nodos en el editor.
 * Si no hay selección, se toma el primer nodo de texto del editor.
 * Permite ajustar la selección y el nodo padre general para el tipo de contenedor que se le pase como parámetro,
 * evitando un posible doble contenedor del mismo tipo y asegurando que las etiquetas de bloque no se posicionen
 * dentro de etiquetas inline.
 */
export class SelectionManager {

    public isRange: boolean = false;
    public commonAncestor: Node | null = null;
    public startNode: NodeSelection | null = null;
    public endNode: NodeSelection | null = null;

    constructor(public readonly editableDiv: HTMLDivElement) {}

    public getSelection(): SelectionManager {
        const selector = new SelectionReader(this.editableDiv);
        const selection = selector.getSelectionDetails();
        this.isRange = selection.isRange;
        this.commonAncestor = selection.commonAncestor;
        this.startNode = selection.startNode;
        this.endNode = selection.endNode;
        return this;
    }

    public adjustForFormatting(formatting: ContainerProps): SelectionManager {
        if (!this.startNode.node || !this.endNode.node) return this;
        this.startNode.findParentToPreserve(formatting, this.editableDiv);
        this.endNode.findParentToPreserve(formatting, this.editableDiv);
        if (this.startNode.parentToPreserve || this.endNode.parentToPreserve)
            this.findCommonAncestor();
        return this;
    }

    private findCommonAncestor(): void {
        if (!this.startNode?.node || !this.endNode?.node)
            throw new Error('Faltan nodos de inicio o fin de selección');
        const preservingStartParent: Node = this.startNode.parentToPreserve || this.startNode.node;
        const preservingEndParent: Node = this.endNode.parentToPreserve || this.endNode.node;

        let startParent: Node | null = this.startNode.node;
        let endParent: Node | null = this.endNode.node;

        while (true) {
            startParent = startParent.parentNode;
            endParent = endParent.parentNode;
            if (!startParent || !endParent)
                throw new Error('No se encontró el ancestro común');
            if (startParent.contains(preservingEndParent)) {
                this.commonAncestor = startParent;
                break;
            }
            if (endParent.contains(preservingStartParent)) {
                this.commonAncestor = endParent;
                break;
            }
        }
    }

}