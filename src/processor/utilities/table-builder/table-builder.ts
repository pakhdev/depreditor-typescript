class TableBuilder {
    public static create(rows: number, cols: number): HTMLElement {
        if (!rows || !cols)
            throw new Error('TableBuilder.create: el número de filas y columnas debe ser mayor a 0');

        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        for (let i = 0; i < rows; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('td');
                const textNode = document.createTextNode('');
                cell.appendChild(textNode);
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        return table;
    }
}

export default TableBuilder;