import { ContainerProps } from '../../types/container-props.type.ts';
import { detectFormattingNode } from '../../helpers/detectFormattingNode.helper.ts';

/**
 * Clase que representa un nodo seleccionado en el editor.
 * Se utiliza para almacenar información sobre la selección actual y facilitar la manipulación de nodos.
 * @property node Nodo seleccionado.
 * @property start Índice de inicio de la selección. Para un nodo de texto, representa el índice del primer
 * carácter seleccionado. Para un nodo de elemento, representa el índice del primer nodo hijo seleccionado.
 * @property end Índice de fin de la selección. Para un nodo de texto, representa el índice hasta(!) el cual se ha
 * seleccionado (inclusivo). Para un nodo de elemento, representa el índice hasta(!) el cual se ha seleccionado (inclusivo).
 * Ejemplos de selecciones:
 * Selección del segundo carácter en un texto: start = 1, end = 2
 * Cursor después del primer carácter en un texto: start = 1, end = 1
 * Selección del primer y segundo elemento: start = 0, end = 2 (seleccionados los elementos en los índices 0 y 1)
 * Cursor después del segundo elemento: start = 2, end = 2
 * @property parentToPreserve Nodo padre que se debe preservar en un contexto específico. Para más información, ver
 * el método findParentToPreserve.
 */
export class NodeSelection {

    private _node: Node | null = null;
    public start: number = 0;
    public end: number = 0;
    public parentToPreserve: Node | null = null;

    constructor(node?: Node) {
        if (!node) return;
        this._node = node;
        this.end = this.length ? this.length : 0;
    }

    public get node(): Node {
        if (!this._node)
            throw new Error('No se ha especificado un nodo');
        return this._node;
    }

    // Indica si la selección es un rango.
    public get isRange(): boolean {
        return this.start !== this.end;
    }

    // Indica si el nodo está completamente seleccionado.
    public get fullySelected(): boolean {
        return this.startSelected && this.endSelected;
    }

    // Indica si hay selección en el inicio de nodo.
    public get startSelected(): boolean {
        return this.start === 0;
    }

    // Indica si hay selección en el final de nodo.
    public get endSelected(): boolean {
        return !this.length || this.end === this.length;
    }

    // Longitud del nodo seleccionado. Para un nodo de texto, representa la longitud del texto. Para un
    // nodo de elemento, representa la cantidad de nodos hijos.
    public get length(): number {
        if (!this._node) return 0;
        return this.node.nodeType === Node.TEXT_NODE
            ? this.node.textContent!.length
            : this.node.childNodes.length;
    }

    // Asigna el índice del primer carácter o nodo seleccionado.
    public setStart(start: number): NodeSelection {
        this.start = start;
        return this;
    }

    // Asigna el índice del carácter o nodo hasta el cual se ha seleccionado.
    public setEnd(end: number): NodeSelection {
        this.end = end;
        return this;
    }

    /**
     * Busca y selecciona el nodo padre más adecuado para preservar en un contexto específico, útil cuando se
     * requiere dividir el nodo en partes.
     * Recorre los nodos padres desde el nodo actual hasta el contenedor editable, buscando un nodo que coincida
     * con el formato especificado o con el grupo de formatos especificado.
     * Si el formato buscado es un bloque, se selecciona el nodo padre que no sea un bloque, ya que colocar bloques
     * dentro de elementos inline no es una práctica recomendada.
     */
    public findParentToPreserve(formatting: ContainerProps, editableDiv: HTMLDivElement): void {
        let parent: Node | null = this.node.parentNode;
        while (parent !== editableDiv && parent !== null) {
            const formattingNode = detectFormattingNode(parent);
            if (formattingNode && (formattingNode.name === formatting.name
                || formatting.isBlock && !formattingNode.isBlock
                || formattingNode.groups?.some(value => formatting.groups?.includes(value))))
                this.parentToPreserve = parent;
            if (!parent.parentNode) throw new Error('No se encontró el nodo padre');
            parent = parent.parentNode;
        }
    }

}