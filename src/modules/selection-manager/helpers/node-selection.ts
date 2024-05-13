import { ContainerProps } from '../../types/container-props.type.ts';
import { detectFormattingNode } from '../../helpers/detectFormattingNode.helper.ts';

/**
 * Clase que representa un nodo seleccionado en el editor.
 * Se utiliza para almacenar información sobre la selección actual y facilitar la manipulación de nodos.
 * @property node Nodo seleccionado.
 * @property start Índice de inicio de la selección. Representa el índice del primer carácter seleccionado
 * @property end Índice de fin de la selección. Representa el índice hasta(!) el cual se ha seleccionado (inclusivo)
 * Selección del segundo carácter en un texto: start = 1, end = 2
 * Cursor después del primer carácter en un texto: start = 1, end = 1
 * @property parentToPreserve Nodo padre que se debe preservar en un contexto específico. Para más información, ver
 * el método findParentToPreserve.
 */
export class NodeSelection {

    public node: Node;
    public start: number = 0;
    public end: number = 0;
    public parentToPreserve: Node | null = null;

    constructor(node: Node, offset: number = 0) {
        if (node.nodeType === Node.TEXT_NODE) {
            this.node = node;
            if (node.textContent?.length)
                this.end = node.textContent.length;
        } else if (node.childNodes.length) {
            this.node = node.childNodes[offset];
        } else {
            this.node = node;
        }
    }

    // Asigna el índice del primer carácter seleccionado.
    public setStart(start: number): NodeSelection {
        if (this.node.nodeType !== Node.TEXT_NODE)
            return this;
        this.start = start;
        return this;
    }

    // Asigna el índice del carácter hasta el cual se ha seleccionado.
    public setEnd(end?: number): NodeSelection {
        if (this.node.nodeType === Node.TEXT_NODE && end !== undefined)
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