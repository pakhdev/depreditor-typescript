/**
 * Clase que representa un nodo seleccionado en el editor.
 * Se utiliza para almacenar información sobre la selección actual y facilitar la manipulación de nodos.
 * @property node Nodo seleccionado.
 * @property start Índice de inicio de la selección. Representa el índice del primer carácter seleccionado
 * @property end Índice de fin de la selección. Representa el índice hasta(!) el cual se ha seleccionado (inclusivo)
 * Selección del segundo carácter en un texto: start = 1, end = 2
 * Cursor después del primer carácter en un texto: start = 1, end = 1
 */
export class NodeSelection {

    public node: Node;
    public start: number = 0;
    public end: number = 0;

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

}