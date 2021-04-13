import assert from 'assert';
import { Container, DisplayObject, Point } from 'pixi.js';
import DefaultLoggerBuilder from '../DefaultLoggerBuilder';
import IDragLogic from './DragLogic/IDragLogic';

export default class DragAndDropArea {
    logger = DefaultLoggerBuilder.inst.build(this);

    dragLogic: IDragLogic;

    private readonly area: Container;
    private target?: DisplayObject;

    constructor(areaOwner: Container, dragLogic: IDragLogic) {
        this.area = new Container();
        this.area.addListener('pointermove', this.onDragMoveAcrossArea);
        areaOwner.addChild(this.area);

        this.dragLogic = dragLogic;
    }

    attach(draggableObject: DisplayObject) {
        draggableObject.interactive = true;
        draggableObject.buttonMode = true;

        draggableObject
            .addListener('pointerdown', this.onSpriteDragStart)
            .addListener('pointerup', this.onSpriteDragEnd)
            .addListener('pointerupoutside', this.onSpriteDragEnd);

        this.area.addChild(draggableObject);

        return draggableObject;
    }

    detach(draggableObject: DisplayObject) {
        this.area.removeChild(draggableObject);

        draggableObject.interactive = false;
        draggableObject.buttonMode = false;

        draggableObject
            .removeListener('pointerdown', this.onSpriteDragStart)
            .removeListener('pointerup', this.onSpriteDragEnd)
            .removeListener('pointerupoutside', this.onSpriteDragEnd);
    }

    hasObject(objectName: string): boolean {
        return this.area.getChildByName(objectName) != null;
    }

    private readonly onSpriteDragStart = (e: PIXI.InteractionEvent) => {
        this.target = e.target;
        this.dragLogic.onDragStart(this.target, e.data.global);

        // // calculate offset of cursor relative to target position
        // this.target.parent.toLocal(e.data.global, undefined, this.pointerOffset);
        // this.pointerOffset.x -= this.target.x;
        // this.pointerOffset.y -= this.target.y;

        // start listening to dragging on the area
        this.area.interactive = true;
    };

    private readonly onSpriteDragEnd = (e: PIXI.InteractionEvent) => {
        if (this.target == null) {
            return;
        }

        this.dragLogic.onDragEnd(this.target!, e.data.global);
        this.target = undefined;

        // stop listening to dragging on the area
        this.area.interactive = false;
    };

    private readonly onDragMoveAcrossArea = (e: PIXI.InteractionEvent) => {
        // Don't use e.target because the pointer might move out of the draggable target
        // if the user drags fast, which would make e.target become the stage.

        assert(this.target);

        // const target = this.target!;

        // // update of target.position
        // target.parent.toLocal(e.data.global, undefined, target.position);
        // target.x -= this.pointerOffset.x;
        // target.y -= this.pointerOffset.y;

        this.dragLogic.onDragMove(this.target!, e.data.global);
    };
}
