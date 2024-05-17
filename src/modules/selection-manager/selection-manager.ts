import { SelectionReader } from './helpers/selection-reader.ts';
import { NodeSelection } from './helpers/node-selection.ts';
import { ContainerProps } from '../../types/container-props.type.ts';
import { SelectionExtender } from './helpers/selection-extender.ts';
import { Topology } from '../topology/topology.ts';
import { SelectionSetter } from './helpers/selection-setter.ts';

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

    public get startSelectionNode(): NodeSelection {
        if (!this.startNode)
            throw new Error('No se ha encontrado el nodo de inicio de la selección');
        return this.startNode;
    }

    public get endSelectionNode(): NodeSelection {
        if (!this.endNode)
            throw new Error('No se ha encontrado el nodo de fin de la selección');
        return this.endNode;
    }

    public get commonAncestorNode(): Node {
        if (!this.commonAncestor)
            throw new Error('No se ha encontrado el ancestro común de los nodos seleccionados');
        return this.commonAncestor;
    }

    // Obtiene los detalles de la selección actual y los asigna a las propiedades de la clase.
    public getSelection(): SelectionManager {
        ({
            isRange: this.isRange,
            commonAncestor: this.commonAncestor,
            startNode: this.startNode,
            endNode: this.endNode,
        } = new SelectionReader(this.editableDiv).getSelectionDetails());
        return this;
    }

    // Ajusta la selección y el nodo padre general para el tipo de contenedor que se le pase como parámetro.
    public adjustForFormatting(formatting: ContainerProps): SelectionManager {
        this.commonAncestor = new SelectionExtender(formatting, this).extendSelection();
        return this;
    }

    // Establece la selección actual a partir de una topología de nodos.
    public setFromTopology(topology: Topology): SelectionManager {
        ({
            isRange: this.isRange,
            commonAncestor: this.commonAncestor,
            startNode: this.startNode,
            endNode: this.endNode,
        } = SelectionSetter.setFromTopology(topology));
        return this;
    }

}