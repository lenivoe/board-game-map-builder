import { Container, DisplayObject, Graphics } from 'pixi.js';
import IClosable from '../../../common/IClosable';
import IGridCollider from '../collider/IGridCollider';
import IGridView from './IGridView';

export default class SquareGridView implements IGridView, IClosable {
    readonly view: DisplayObject;
    readonly collider: IGridCollider;

    private readonly viewOwner: Container;

    constructor(viewOwner: Container, collider: IGridCollider, color: number = 0xffffff) {
        const view = new Graphics().lineStyle(collider.cellSize / 32, color);

        const width = collider.cellSize * collider.rowLen;
        const height = collider.cellSize * collider.columnLen;

        for (let i = 0; i <= collider.rowLen; i++) {
            const x = i * collider.cellSize;
            view.moveTo(x, 0).lineTo(x, height);
        }

        for (let i = 0; i <= collider.columnLen; i++) {
            const y = i * collider.cellSize;
            view.moveTo(0, y).lineTo(width, y);
        }

        viewOwner.addChild(view);

        this.viewOwner = viewOwner;
        this.view = view;
        this.collider = collider;
    }

    close(): void {
        this.viewOwner.removeChild(this.view);
    }
}
