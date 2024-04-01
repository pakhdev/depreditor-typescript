import { ContainerProps } from '../../types/container-props.type.ts';
import { detectFormattingNode } from '../../helpers/detectFormattingNode.helper.ts';

/**
 * Clase que representa un nodo seleccionado en el editor.
 */
export class NodeSelection {

    public node: Node | null = null;
    public start: number = 0;
    public end: number = 0;
    public parentToPreserve: Node | null = null;

    constructor(node?: Node) {
        if (!node) return;
        this.node = node;
        this.end = this.length ? this.length : 0;
    }

    public get fullySelected(): boolean {
        return this.startSelected && this.endSelected;
    }

    public get startSelected(): boolean {
        return this.start === 0;
    }

    public get endSelected(): boolean {
        return !this.length || this.end === this.length;
    }

    public get length(): number {
        if (!this.node) return 0;
        return this.node.nodeType === Node.TEXT_NODE
            ? this.node.textContent!.length
            : this.node.childNodes.length;
    }

    public setStart(start: number): NodeSelection {
        this.start = start;
        return this;
    }

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
        if (!this.node) return;
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