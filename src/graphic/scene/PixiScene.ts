import assert from 'assert';
import * as PIXI from 'pixi.js';
import { clamp } from '../../common/Utils';
import IPixiScene from './IPixiScene';
import DefaultLoggerBuilder from '../DefaultLoggerBuilder';
import SquareGridCollider from '../grid/collider/SquareGridCollider';
import DefaultDnDLogicBuilder from './DefaultDnDLogicBuilder';
import DragAndDropArea from '../dragAndDrop/DragAndDropArea';
import IGridView from '../grid/view/IGridView';
import SquareGridView from '../grid/view/SquareGridView';

export default class PixiScene implements IPixiScene {
    /** replaceable logger writes to browser console by default */
    logger = DefaultLoggerBuilder.inst.build(this);

    private readonly _container: PIXI.Container;
    private grid: IGridView;
    private objectArea: DragAndDropArea;

    private tokenMap: Map<string, PIXI.DisplayObject> = new Map();

    constructor(rowLen: number, columnLen: number, cellSize: number = 50) {
        assert(Number.isInteger(rowLen));
        assert(Number.isInteger(columnLen));
        assert(Number.isInteger(cellSize));

        this._container = new PIXI.Graphics()
            .beginFill(0x000000)
            .drawRect(0, 0, rowLen * cellSize, columnLen * cellSize);
        this._container.interactive = true;

        const gridColleder = new SquareGridCollider(rowLen, columnLen, cellSize);

        const alphaOnDrag = 0.5;
        const dndLogic = DefaultDnDLogicBuilder.inst.build(gridColleder, alphaOnDrag);

        this.objectArea = new DragAndDropArea(this._container, dndLogic);

        this.grid = new SquareGridView(this._container, gridColleder);

        /**
         * временная фигура для отладки
         */
        // перекрестие
        const lineWidth = 32;

        const hLine = new PIXI.Graphics()
            .beginFill(0x00ff00)
            .drawRect(0, -lineWidth / 2, this.width, lineWidth);
        hLine.position.set(0, this.height / 2);
        this.container.addChild(hLine);

        const vLine = new PIXI.Graphics()
            .beginFill(0x00ff00)
            .drawRect(-lineWidth / 2, 0, lineWidth, this.height);
        vLine.position.set(this.width / 2, 0);
        this.container.addChild(vLine);

        const point = new PIXI.Graphics().beginFill(0xff00ff).drawCircle(0, 0, lineWidth);
        point.position.set(this.width / 2, this.height / 2);
        this.container.addChild(point);
    }

    get x(): number {
        return this.container.x;
    }
    get y(): number {
        return this.container.y;
    }

    get rowLen(): number {
        return this.grid.collider.rowLen;
    }
    get columnLen(): number {
        return this.grid.collider.columnLen;
    }
    get cellSize(): number {
        return this.grid.collider.cellSize;
    }

    get container(): PIXI.Container {
        return this._container;
    }

    get scale(): number {
        return this.container.scale.x;
    }
    set scale(scale: number) {
        this.container.scale.set(scale);
    }

    get width() {
        return this.rowLen * this.cellSize;
    }
    get height() {
        return this.columnLen * this.cellSize;
    }

    centerTo(x: number, y: number) {
        const updatedX = x - this.container.width / 2;
        const updatedY = y - this.container.height / 2;
        this.container.position.set(updatedX, updatedY);
    }

    scaleTo(width: number, height: number) {
        const scaledWidth = width / this.width;
        const scaledHeight = height / this.height;
        this.scale = Math.min(scaledWidth, scaledHeight);
    }

    addImage(name: string, url: string, x: number, y: number, isSnappingGrid: boolean) {
        assert(!this.hasImage(name));

        const sprite = PIXI.Sprite.from(url);

        x = clamp(x - this.x, 0, this.width);
        y = clamp(y - this.y, 0, this.height);

        let { width, height } = sprite;

        if (isSnappingGrid) {
            const snapToGrid = (v: number) => this.grid.collider.snapToGrid(v);

            [x, y] = [snapToGrid(x), snapToGrid(y)];

            if (width > this.cellSize) {
                width = snapToGrid(width);
            }
            if (height > this.cellSize) {
                height = snapToGrid(height);
            }
        }

        sprite.name = name;
        sprite.position.set(x, y);
        sprite.width = width;
        sprite.height = height;

        this.logger.info(
            `new sprite <id=${sprite.name}, x=${sprite.x}, y=${sprite.y}, w=${sprite.width}, h=${sprite.height}>`
        );

        this.objectArea.attach(sprite);
        this.tokenMap.set(name, sprite);
    }

    removeImageIfExist(name: string) {
        const token = this.tokenMap.get(name);
        if (token) {
            this.objectArea.detach(token);
            this.tokenMap.delete(name);
        }
    }

    hasImage(name: string): boolean {
        return this.tokenMap.has(name);
    }
}
