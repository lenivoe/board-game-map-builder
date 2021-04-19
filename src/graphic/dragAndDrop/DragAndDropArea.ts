import assert from 'assert';
import { Container, DisplayObject } from 'pixi.js';
import IClosable from '../../common/IClosable';
import DefaultLoggerBuilder from '../DefaultLoggerBuilder';
import IDragLogic from './DragLogic/IDragLogic';

export default class DragAndDropArea implements IClosable {
    logger = DefaultLoggerBuilder.inst.build(this);

    dragLogic: IDragLogic;

    private readonly area: Container;
    private readonly areaOwner: Container;
    private target?: DisplayObject;

    private readonly displayObjects: DisplayObject[] = [];

    constructor(areaOwner: Container, dragLogic: IDragLogic) {
        this.area = new Container();
        this.area.name = 'drag and drop area';
        this.area.addListener('pointermove', this.onDragMoveAcrossArea);
        areaOwner.addChild(this.area);

        this.areaOwner = areaOwner;
        this.dragLogic = dragLogic;
    }

    close(): void {
        this.areaOwner.removeChild(this.area);
    }

    attach(draggableObject: DisplayObject) {
        draggableObject.interactive = true;
        draggableObject.buttonMode = true;

        draggableObject
            .addListener('pointerdown', this.onSpriteDragStart)
            .addListener('pointerup', this.onSpriteDragEnd)
            .addListener('pointerupoutside', this.onSpriteDragEnd);

        this.displayObjects.push(draggableObject);

        return draggableObject;
    }

    detach(draggableObject: DisplayObject) {
        this.displayObjects.splice(this.displayObjects.indexOf(draggableObject), 1);

        draggableObject.interactive = false;
        draggableObject.buttonMode = false;

        draggableObject
            .removeListener('pointerdown', this.onSpriteDragStart)
            .removeListener('pointerup', this.onSpriteDragEnd)
            .removeListener('pointerupoutside', this.onSpriteDragEnd);
    }

    hasObject(name: string): boolean {
        return this.displayObjects.findIndex((value) => value.name === name) >= 0;
    }

    private readonly onSpriteDragStart = (e: PIXI.InteractionEvent) => {
        this.target = e.target;
        this.dragLogic.onDragStart(this.target, e.data.global);

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

        this.dragLogic.onDragMove(this.target!, e.data.global);
    };
}
