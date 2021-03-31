import assert from 'assert';
import * as PIXI from 'pixi.js';
import DefaultLoggerBuilder from '../logger/DefaultLoggerBuilder';
import ILogger from '../logger/ILogger';

export interface IScene {
    /** sprite container. do not use it */
    container: PIXI.Container;
    scale: number;

    /** @readonly x of left-top corner */
    x: number;
    /** @readonly y of left-top corner */
    y: number;

    /** @readonly cells amount in the row */
    rowLen: number;
    /** @readonly cells amount in the column */
    columnLen: number;
    /** @readonly size of cell in pixels */
    cellSize: number;

    width: number;
    height: number;

    /** place scene to the center of the rectangle */
    centerTo(x: number, y: number): void;
    /** scales scene to the specified size */
    scaleTo(width: number, height: number): void;

    /**
     * @param id unique image name
     * @param base64str base64 encoded image data
     * @param x x of left-top corner in pixels
     * @param y y of left-top corner in pixels
     * @param isSnappingGrid if true then image fitting to the cells
     */
    addImage(id: string, base64str: string, x: number, y: number, isSnappingGrid: boolean): void;

    /** @param id unique image name */
    removeImageIfExist(id: string): void;

    /**
     * @param id unique image name
     * @returns true if scene has image with such name
     */
    hasImage(id: string): boolean;
}

export class PixiScene implements IScene {
    readonly rowLen: number;
    readonly columnLen: number;
    readonly cellSize: number;

    /** replaceable logger writes to browser console by default */
    logger: ILogger = DefaultLoggerBuilder.build(this);

    private readonly _container: PIXI.Container;
    private readonly spriteCollection: Map<string, PIXI.Sprite> = new Map();

    constructor(rowLen: number, columnLen: number, cellSize: number = 50) {
        assert(Number.isInteger(rowLen));
        assert(Number.isInteger(columnLen));
        assert(Number.isInteger(cellSize));

        this.rowLen = rowLen;
        this.columnLen = columnLen;
        this.cellSize = cellSize;

        this._container = new PIXI.Graphics().beginFill(0x000000).drawRect(0, 0, this.width, this.height);

        /**
         * временная фигура для отладки
         */
        // квадрат в середине
        const box = new PIXI.Graphics().beginFill(0x00aabb).drawRect(0, 0, this.width / 3, this.height / 3);
        box.position.set((this.width - box.width) / 2, (this.height - box.height) / 2);
        this.container.addChild(box);

        // перекрестие
        const hLine = new PIXI.Graphics().beginFill(0x00ff00).drawRect(0, -1, this.width, 2);
        hLine.position.set(0, this.height / 2);
        this.container.addChild(hLine);

        const vLine = new PIXI.Graphics().beginFill(0x00ff00).drawRect(-1, 0, 2, this.height);
        vLine.position.set(this.width / 2, 0);
        this.container.addChild(vLine);

        const point = new PIXI.Graphics().beginFill(0xff00ff).drawCircle(0, 0, 6);
        point.position.set(this.width / 2, this.height / 2);
        this.container.addChild(point);
    }

    get x(): number {
        return this.container.x;
    }
    get y(): number {
        return this.container.y;
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

    /** scene width without scale */
    get width() {
        return this.rowLen * this.cellSize;
    }
    /** scene height without scale */
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

    addImage(id: string, url: string, x: number, y: number, isSnappingGrid: boolean) {
        assert(!this.hasImage(id));

        const sprite = PIXI.Sprite.from(url);
        sprite.interactive = true;
        sprite.buttonMode = true;

        let { width, height } = sprite;

        if (isSnappingGrid) {
            [x, y] = [this.snapToGrid(x), this.snapToGrid(y)];

            if (width > this.cellSize) {
                width = this.snapToGrid(width);
            }
            if (height > this.cellSize) {
                height = this.snapToGrid(height);
            }
        }

        this.logger.debug(`new sprite <id=${id}, x=${x}, y=${y}, w=${width}, h=${height}>`);

        sprite.position.set(x, y);
        sprite.width = width;
        sprite.height = height;

        this.container.addChild(sprite);
        this.spriteCollection.set(id, sprite);
    }

    removeImageIfExist(id: string) {
        const sprite = this.spriteCollection.get(id);
        if (sprite) {
            this.container.removeChild(sprite);
            this.spriteCollection.delete(id);
        }
    }

    hasImage(id: string): boolean {
        return this.spriteCollection.has(id);
    }

    private snapToGrid(value: number): number {
        const snapped = Math.round(value / this.cellSize) * this.cellSize;
        return snapped;
    }
}
