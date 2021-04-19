import { Container, Graphics } from 'pixi.js';
import IClosable from '../../../common/IClosable';
import IGridCollider from '../collider/IGridCollider';
import IGridView from './IGridView';

export default class SquareGridView implements IGridView, IClosable {
    readonly collider: IGridCollider;

    private readonly viewOwner: Container;
    private readonly view: Graphics;

    private readonly color: number;

    constructor(viewOwner: Container, collider: IGridCollider, color: number = 0xcccccc) {
        this.viewOwner = viewOwner;
        this.view = new Graphics();
        this.collider = collider;
        this.color = color;

        viewOwner.addChild(this.view);
    }

    close(): void {
        this.viewOwner.removeChild(this.view);
    }

    redraw(): void {
        this.view.clear().lineStyle(8 * this.viewOwner.scale.x, this.color);

        const width = this.collider.cellSize * this.collider.rowLen;
        const height = this.collider.cellSize * this.collider.columnLen;

        for (let i = 0; i <= this.collider.rowLen; i++) {
            const x = i * this.collider.cellSize;
            this.view.moveTo(x, 0).lineTo(x, height);
        }

        for (let i = 0; i <= this.collider.columnLen; i++) {
            const y = i * this.collider.cellSize;
            this.view.moveTo(0, y).lineTo(width, y);
        }
    }
}
