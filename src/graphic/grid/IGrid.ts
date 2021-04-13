export default interface IGrid {
    cellSize: number;
    snapToGrid(value: number): number;
}
