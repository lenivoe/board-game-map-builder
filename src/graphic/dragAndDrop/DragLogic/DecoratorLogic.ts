import { DisplayObject, Point } from 'pixi.js';
import IDragLogic from './IDragLogic';

export default abstract class WrapperLogic implements IDragLogic {
    constructor(private logic: IDragLogic) {}

    onDragStart(draggable: DisplayObject, globalMousePos: Point): void {
        this.logic.onDragStart(draggable, globalMousePos);
    }
    onDragMove(draggable: DisplayObject, globalMousePos: Point): void {
        this.logic.onDragMove(draggable, globalMousePos);
    }
    onDragEnd(draggable: DisplayObject, globalMousePos: Point): void {
        this.logic.onDragEnd(draggable, globalMousePos);
    }
}
