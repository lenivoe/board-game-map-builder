import IGrid from './IGrid';

export default class SquareGrid implements IGrid {
    constructor(public cellSize: number) {}
    snapToGrid(value: number): number {
        return Math.round(value / this.cellSize) * this.cellSize;
    }
}
