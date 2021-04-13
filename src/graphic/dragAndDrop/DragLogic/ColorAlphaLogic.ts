import { DisplayObject, Point } from 'pixi.js';
import DefaultLoggerBuilder from '../../DefaultLoggerBuilder';
import IDragLogic from './IDragLogic';

export default class ColorAlphaLogic implements IDragLogic {
    logger = DefaultLoggerBuilder.inst.build(this);

    private oldAlpha: number = 1;

    constructor(private alpha: number) {}

    onDragStart(draggable: DisplayObject, _globalMousePos: Point): void {
        this.oldAlpha = draggable.alpha;
        draggable.alpha = this.alpha;

        this.logger.info(
            `onDragStart: token '${draggable.name}' alpha: ${draggable.alpha}`
        );
    }
    onDragMove(_draggable: DisplayObject, _globalMousePos: Point): void {}
    onDragEnd(draggable: DisplayObject, _globalMousePos: Point): void {
        draggable.alpha = this.oldAlpha;

        this.logger.info(
            `onDragEnd: token '${draggable.name}' alpha: ${draggable.alpha}`
        );
    }
}
