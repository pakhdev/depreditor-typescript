export class NodesManager {

    private nodesBackup;
    private nodes;

    // ** =========================
    // *  Carga de nodos
    // ** =========================

    public loadFromSelection(): void {

    }

    // ** =========================
    // *  Creación de Backup
    // ** =========================

    public makeBackup(activate: boolean): void {
        if (!activate) return;
    }

    // ** =========================
    // *  Filtración de nodos
    // ** =========================

    public filterSelectedNodes(): void {}

    public filterFormattedNodes(): void {}

    public filterUnformattedNodes(): void {}

    // ** =========================
    // *  Modificación de nodos
    // ** =========================

    public detachSelectedFragment(): void {}

    public applyFormat(): void {}

    public removeFormat(): void {}

    // ** =========================
    // *  Retorno de datos
    // ** =========================

    public getBackup(): void {}

    public getNodes(): void {}

    public getPreviousNode(): void {}

    public getNextNode(): void {}

    public getFormattingList(): void {}

}