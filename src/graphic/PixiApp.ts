import * as PIXI from 'pixi.js';
import DefaultLoggerBuilder from './DefaultLoggerBuilder';
import IResizable from '../common/IResizable';
import IClosable from '../common/IClosable';
import IPixiScene, { TokenLayerType } from './scene/IPixiScene';
import assert from 'assert';

export interface IPixiViewport extends IResizable, IClosable {
    isSnappingGrid: boolean;

    setScene(scene: IPixiScene): void;
    addImageIfMissing(name: string, url: string, x: number, y: number): void;
    removeImageIfExist(name: string): void;
}

interface OptionalParams {
    width?: number;
    height?: number;
}

export default class PixiApp implements IPixiViewport {
    /** parent html element */
    readonly root: HTMLElement;

    /** replaceable logger writes to browser console by default */
    logger = DefaultLoggerBuilder.inst.build(this);

    /** if true then image fitting to the cells */
    isSnappingGrid: boolean = true;

    private readonly app: PIXI.Application;
    private scene!: IPixiScene;

    constructor(
        root: HTMLElement,
        scene: IPixiScene,
        { width, height }: OptionalParams = {}
    ) {
        this.root = root;

        this.app = new PIXI.Application({
            backgroundColor: 0x00aa00,
            width: width ?? root.clientWidth,
            height: height ?? root.clientHeight,
        });
        root.appendChild(this.app.view);

        this.setScene(scene);

        this.app.ticker.add((delta) => {
            this.scene.render(this.app.renderer);
        });
    }

    setScene(scene: IPixiScene) {
        this.scene = scene;

        this.app.stage.removeChildren();
        this.app.stage.addChild(scene.container);

        scene.scaleTo(this.width, this.height);
        scene.centerTo(this.width / 2, this.height / 2);
    }

    changeLayer(layer: TokenLayerType): void {
        this.scene.changeLayer(layer);
    }

    addImageIfMissing(name: string, url: string, x: number, y: number): void {
        assert(!this.scene.hasToken(name));

        if (!this.scene.hasToken(name)) {
            this.scene.addToken(name, url, x, y, this.isSnappingGrid);
        }
    }

    removeImageIfExist(name: string): void {
        this.scene.removeToken(name);
    }

    get width() {
        return this.app.screen.width;
    }
    get height() {
        return this.app.screen.height;
    }

    close() {
        this.app.destroy(true);
    }

    resize(width: number, height: number) {
        this.app.renderer.resize(width, height);
        this.scene.centerTo(width / 2, height / 2);
    }
}
