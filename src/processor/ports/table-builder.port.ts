import TableBuilder from '../utilities/table-builder/table-builder.ts';

class TableBuilderPort {
    create(rows: number, cols: number): HTMLElement {
        return TableBuilder.create(rows, cols);
    }
}

export default TableBuilderPort;