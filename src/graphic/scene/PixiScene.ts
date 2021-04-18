import assert from 'assert';
import * as PIXI from 'pixi.js';
import { clamp } from '../../common/Utils';
import IPixiScene, { TokenLayerType } from './IPixiScene';
import DefaultLoggerBuilder from '../DefaultLoggerBuilder';
import SquareGridCollider from '../grid/collider/SquareGridCollider';
import DefaultDnDLogicBuilder from './DefaultDnDLogicBuilder';
import DragAndDropArea from '../dragAndDrop/DragAndDropArea';
import IGridView from '../grid/view/IGridView';
import SquareGridView from '../grid/view/SquareGridView';

interface ShadowcastShaderUniforms {
    uObserverAmount: number;
    uObserverPosList: number[];
    uObserverRadiusList: number[];
    uShadowColor: number[];
}

export default class PixiScene implements IPixiScene {
    /** replaceable logger writes to browser console by default */
    logger = DefaultLoggerBuilder.inst.build(this);

    private readonly _container: PIXI.Container;
    private grid: IGridView;
    private objectArea: DragAndDropArea;

    private readonly shadowcastShader!: PIXI.Filter;
    private layerType: TokenLayerType = TokenLayerType.PLAYER;
    private readonly tokens: PIXI.Container[];

    private loader = new PIXI.Loader();

    constructor(rowLen: number, columnLen: number, cellSize: number = 50) {
        assert(Number.isInteger(rowLen));
        assert(Number.isInteger(columnLen));
        assert(Number.isInteger(cellSize));

        const [width, height] = [rowLen * cellSize, columnLen * cellSize];

        this._container = new PIXI.Graphics()
            .beginFill(0x000000)
            .drawRect(0, 0, width, height);
        this._container.interactive = true;

        this.tokens = [new PIXI.Container(), new PIXI.Container(), new PIXI.Container()];
        this.tokens[TokenLayerType.BACKGROUND].name = 'BACKGROUND';
        this.tokens[TokenLayerType.BARRIER].name = 'BARRIER';
        this.tokens[TokenLayerType.PLAYER].name = 'PLAYER';

        this._container.addChild(...this.tokens);

        const gridColleder = new SquareGridCollider(rowLen, columnLen, cellSize);

        const alphaOnDrag = 0.5;
        const dndLogic = DefaultDnDLogicBuilder.inst.build(gridColleder, alphaOnDrag);

        this.objectArea = new DragAndDropArea(this._container, dndLogic);

        this.grid = new SquareGridView(this._container, gridColleder);

        /**
         * TODO: fix!
         */
        // this.initFogOfWarShader();
        /**
         * TODO: fix!
         */

        /**
         * временная фигура для отладки
         */
        // перекрестие
        const lineWidth = 32;

        const point = new PIXI.Graphics().beginFill(0xff00ff).drawCircle(0, 0, lineWidth);
        point.position.set(this.width / 2, this.height / 2);
        this.container.addChild(point);
    }

    async init(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.loader
                .add('vertDefault', 'glsl/default.vert')
                .add('fragFogOfWar', 'glsl/fog_of_war.frag');

            type Resources = {
                vertDefault: PIXI.LoaderResource;
                fragFogOfWar: PIXI.LoaderResource;
            };
            this.loader.onComplete.add((loader: PIXI.Loader, resources: Resources) => {
                this.logger.info('async init:', loader, resources);
                resolve();
            });
            this.loader.onError.add((err) => {
                this.logger.err('async init:', err);
                reject(err);
            });

            this.loader.load();
        });
    }

    changeLayer(layer: TokenLayerType): void {
        this.logger.info(
            `change layer ${TokenLayerType[this.layerType]} to ${TokenLayerType[layer]}`
        );

        this.layerType = layer;
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

    render(renderer: PIXI.Renderer): void {
        // if (!this.shadowcastShader) {
        //     return;
        // }
        // // renderer.render(this.container, undefined, true);
        // const tokens = [...this.tokens[this.layerType].values()];
        // const uniforms = this.shadowcastShader.uniforms;
        // uniforms.uObserverAmount = tokens.length;
        // uniforms.uObserverPosList = tokens.flatMap(({ x, y }) => [x, y]);
        // uniforms.uObserverRadiusList = [5 * this.cellSize];
        // // renderer.render(circleWall, fogOfWarRT, true);
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

    addToken(name: string, url: string, x: number, y: number, isSnappingGrid: boolean) {
        if (this.hasToken(name)) {
            return false;
        }

        const sprite = PIXI.Sprite.from(url);

        x = clamp((x - this.x) / this.scale, 0, this.width);
        y = clamp((y - this.y) / this.scale, 0, this.height);

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

        this.logger.debug(sprite.name, sprite.parent.name);

        this.layer.addChild(sprite);

        this.logger.debug(sprite.name, sprite.parent.name);

        return true;
    }

    removeToken(name: string): boolean {
        const token: PIXI.DisplayObject | null = this.layer.getChildByName(name);
        if (token) {
            this.objectArea.detach(token);
            this.layer.removeChild(token);
        }
        return token != null;
    }

    hasToken(name: string): boolean {
        return this.layer.getChildByName(name) != null;
    }

    private get layer(): PIXI.Container {
        return this.tokens[this.layerType];
    }

    private initFogOfWarShader() {
        const fogOfWarRT = PIXI.RenderTexture.create({
            width: this.width,
            height: this.height,
        });
        const forOfWarSprite = new PIXI.Sprite(fogOfWarRT);
        forOfWarSprite.name = 'shadowedSprite';

        const uniforms: ShadowcastShaderUniforms = {
            uObserverAmount: 0,
            uObserverPosList: [],
            uObserverRadiusList: [],
            uShadowColor: [0, 0, 0, 0.97],
        };

        const shadowmapFilter = new PIXI.Filter(
            this.loader.resources.vertDefault.data,
            this.loader.resources.fragFogOfWar.data,
            uniforms
        );

        forOfWarSprite.filters = [
            shadowmapFilter,
            new PIXI.filters.BlurFilter(),
            new PIXI.filters.AlphaFilter(1),
        ];

        /**
         * TODO: переделать препятствия и, вероятно, спрайт с туманом войны
         */
        const circleWall = new PIXI.Graphics()
            .beginFill(0xff00ff)
            .drawCircle(this.width / 2, this.height / 2, this.cellSize * 2);

        this.container.addChild(circleWall);
        this.container.addChild(forOfWarSprite);
    }
}
