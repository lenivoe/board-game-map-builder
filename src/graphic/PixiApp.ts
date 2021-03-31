import * as PIXI from 'pixi.js';
import DefaultLoggerBuilder from '../logger/DefaultLoggerBuilder';
import ILogger from '../logger/ILogger';
import { clamp } from '../common/Utils';
import IResizable from '../common/IResizable';
import IClosable from '../common/IClosable';
import { IScene } from './PixiScene';

export interface IPixiViewport extends IResizable, IClosable {
    isSnappingGrid: boolean;

    setScene(scene: IScene): void;
    addImageIfMissing(name: string, url: string, x: number, y: number): void;
    removeImageIfExist(name: string): void;
}

interface OptionalParams {
    width?: number;
    height?: number;
}

export default class PixiApp implements IPixiViewport {
    /** replaceable logger writes to browser console by default */
    logger: ILogger = DefaultLoggerBuilder.build(this);

    /** if true then image fitting to the cells */
    isSnappingGrid: boolean = true;

    private readonly app: PIXI.Application;
    private scene!: IScene;

    constructor(readonly root: HTMLElement, scene: IScene, { width, height }: OptionalParams = {}) {
        this.app = new PIXI.Application({
            backgroundColor: 0x00aa00,
            width: width ?? root.clientWidth,
            height: height ?? root.clientHeight,
        });
        root.appendChild(this.app.view);
        this.setScene(scene);
    }

    setScene(scene: IScene) {
        this.scene = scene;

        this.app.stage.removeChildren();
        this.app.stage.addChild(scene.container);

        scene.scaleTo(this.width, this.height);
        scene.centerTo(this.width / 2, this.height / 2);
    }

    addImageIfMissing(name: string, url: string, x: number, y: number): void {
        if (!this.scene.hasImage(name)) {
            const xInSceneSpace = clamp(x - this.scene.x, 0, this.scene.width);
            const yInSceneSpace = clamp(y - this.scene.y, 0, this.scene.height);

            this.scene.addImage(name, url, xInSceneSpace, yInSceneSpace, this.isSnappingGrid);
        }
    }

    removeImageIfExist(name: string): void {
        this.scene.removeImageIfExist(name);
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
