import IGridCollider from './IGridCollider';

export default class SquareGridCollider implements IGridCollider {
    readonly rowLen: number;
    readonly columnLen: number;
    readonly cellSize: number;

    constructor(rowLen: number, columnLen: number, cellSize: number) {
        this.rowLen = rowLen;
        this.columnLen = columnLen;
        this.cellSize = cellSize;
    }

    snapToGrid(value: number): number {
        return Math.round(value / this.cellSize) * this.cellSize;
    }
}
