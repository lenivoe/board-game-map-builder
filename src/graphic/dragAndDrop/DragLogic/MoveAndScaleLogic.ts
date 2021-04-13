import assert from 'assert';
import { DisplayObject, Point } from 'pixi.js';
import DefaultLoggerBuilder from '../../DefaultLoggerBuilder';
import IDragLogic from './IDragLogic';

export default class MoveAndScaleLogic implements IDragLogic {
    logger = DefaultLoggerBuilder.inst.build(this);

    private target?: DisplayObject;
    private pointerOffset: Point = new Point();

    onDragStart(draggable: DisplayObject, globalMousePos: Point): void {
        this.target = draggable;

        // calculate offset of cursor relative to target position
        draggable.parent.toLocal(globalMousePos, undefined, this.pointerOffset);
        this.pointerOffset.x -= draggable.x;
        this.pointerOffset.y -= draggable.y;

        this.logger.info(
            `onDragStart: token '${draggable.name}' [${draggable.x}, ${draggable.y}]:`
        );
    }

    onDragMove(draggable: DisplayObject, globalMousePos: Point): void {
        assert(this.target);

        if (this.target !== draggable) {
            this.logger.err(
                'onDragMove: current target id is',
                `${this.target!.name} but recieved item id is ${draggable.name}`
            );
            return;
        }

        // update of target.position
        draggable.parent.toLocal(globalMousePos, undefined, draggable.position);
        draggable.x -= this.pointerOffset.x;
        draggable.y -= this.pointerOffset.y;
    }

    onDragEnd(draggable: DisplayObject, _globalMousePos: Point): void {
        assert(this.target);

        if (this.target !== draggable) {
            this.logger.err(
                'onDragEnd: current target id is',
                `${this.target!.name} but recieved item id is ${draggable.name}`
            );
            return;
        }

        this.logger.info(
            `onDragEnd: token '${draggable.name}' [${draggable.x}, ${draggable.y}]:`
        );

        this.target = undefined;
    }
}
