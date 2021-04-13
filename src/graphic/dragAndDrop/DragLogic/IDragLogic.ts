import { DisplayObject, Point } from 'pixi.js';

export default interface IDragLogic {
    onDragStart(draggable: DisplayObject, globalMousePos: Point): void;
    onDragMove(draggable: DisplayObject, globalMousePos: Point): void;
    onDragEnd(draggable: DisplayObject, globalMousePos: Point): void;
}
