export default interface IGridCollider {
    /** @readonly cells amount in the row */
    rowLen: number;
    /** @readonly cells amount in the column */
    columnLen: number;
    /** @readonly size of cell in pixels */
    cellSize: number;

    /** clamps a value by the cell size */
    snapToGrid(value: number): number;
}
