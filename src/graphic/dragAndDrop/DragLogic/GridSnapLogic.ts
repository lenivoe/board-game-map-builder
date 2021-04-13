import { DisplayObject, Point } from 'pixi.js';
import DefaultLoggerBuilder from '../../DefaultLoggerBuilder';
import IGrid from '../../grid/IGrid';
import IDragLogic from './IDragLogic';
import DecoratorLogic from './DecoratorLogic';

export default class GridSnapLogic extends DecoratorLogic {
    logger = DefaultLoggerBuilder.inst.build(this);
    private grid: IGrid;

    constructor(logic: IDragLogic, grid: IGrid) {
        super(logic);
        this.grid = grid;
    }

    onDragStart(draggable: DisplayObject, globalMousePos: Point): void {
        super.onDragStart(draggable, globalMousePos);

        this.logger.info(
            `onDragStart: token '${draggable.name}' [${draggable.x}, ${draggable.y}]`
        );
    }

    onDragMove(draggable: DisplayObject, globalMousePos: Point): void {
        super.onDragMove(draggable, globalMousePos);

        draggable.x = this.grid.snapToGrid(draggable.x);
        draggable.y = this.grid.snapToGrid(draggable.y);
    }

    onDragEnd(draggable: DisplayObject, globalMousePos: Point): void {
        super.onDragEnd(draggable, globalMousePos);

        this.logger.info(
            `onDragEnd: token '${draggable.name}' [${draggable.x}, ${draggable.y}]`
        );
    }
}
