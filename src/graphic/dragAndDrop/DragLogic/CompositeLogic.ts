import { DisplayObject, Point } from 'pixi.js';
import IDragLogic from './IDragLogic';

export default class CompositeLogic implements IDragLogic {
    private logicItems: IDragLogic[];

    constructor(...logicList: IDragLogic[]) {
        this.logicItems = logicList;
    }

    add(...newItems: IDragLogic[]) {
        this.logicItems.push(...newItems);
    }

    remove(...itemsToRemove: IDragLogic[]) {
        this.logicItems = this.logicItems.filter((item) => {
            return itemsToRemove.findIndex((removing) => removing === item) < 0;
        });
    }

    get values(): IterableIterator<IDragLogic> {
        return this.logicItems[Symbol.iterator]();
    }

    onDragStart(draggable: DisplayObject, globalMousePos: Point): void {
        for (const logic of this.logicItems) {
            logic.onDragStart(draggable, globalMousePos);
        }
    }
    onDragMove(draggable: DisplayObject, globalMousePos: Point): void {
        for (const logic of this.logicItems) {
            logic.onDragMove(draggable, globalMousePos);
        }
    }
    onDragEnd(draggable: DisplayObject, globalMousePos: Point): void {
        for (const logic of this.logicItems) {
            logic.onDragEnd(draggable, globalMousePos);
        }
    }
}
