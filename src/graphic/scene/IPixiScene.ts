import * as PIXI from 'pixi.js';

export enum TokenLayerType {
    BACKGROUND = 0,
    BARRIER,
    PLAYER,
}

export default interface IPixiScene {
    /** sprite container. do not use it */
    container: PIXI.Container;
    /** default scale is 1 */
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

    /** scene width without scale */
    width: number;
    /** scene height without scale */
    height: number;

    /** render by renderer of pixi app */
    render(renderer: PIXI.Renderer): void;

    /** place scene to the center of the rectangle */
    centerTo(x: number, y: number): void;
    /** scales scene to the specified size */
    scaleTo(width: number, height: number): void;

    /**
     * @param name unique image name
     * @param base64str base64 encoded image data
     * @param x x of left-top corner in pixels
     * @param y y of left-top corner in pixels
     * @param isSnappingGrid if true then image fitting to the cells
     */
    addToken(
        name: string,
        base64str: string,
        x: number,
        y: number,
        isSnappingGrid: boolean
    ): boolean;

    /** @param name unique image name */
    removeToken(name: string): boolean;

    /**
     * @param name unique image name
     * @returns true if scene has image with such name
     */
    hasToken(name: string): boolean;

    /**
     * set active layer
     *
     * it can affect the view, adding and removing tokens
     */
    changeLayer(layer: TokenLayerType): void;
}
