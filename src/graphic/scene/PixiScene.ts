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
import ConsoleLogger from '../../logger/ConsoleLogger';

interface FogOfWarShaderUniforms {
    uObserverAmount: number;
    uObserverPosList?: number[];
    uObserverRadiusList?: number[];
    uBarrierTex: PIXI.Texture;
}

export default class PixiScene implements IPixiScene {
    /** replaceable logger writes to browser console by default */
    logger = DefaultLoggerBuilder.inst.build(this);

    private readonly _container: PIXI.Container;
    private grid: IGridView;
    private dndArea: DragAndDropArea;

    private layerType: TokenLayerType = TokenLayerType.PLAYER;

    private readonly barrierRT: PIXI.RenderTexture;
    private readonly fogOfWarRT: PIXI.RenderTexture;
    private readonly fogOfWarSprite: PIXI.Sprite;
    private readonly fogOfWarShader: PIXI.Filter;

    private readonly foggyContainer: PIXI.Container;
    private readonly fogMaskSprite: PIXI.Sprite;

    private readonly tokens: PIXI.Container[];

    private constructor(
        rowLen: number,
        columnLen: number,
        cellSize: number,
        resources: PIXI.IResourceDictionary
    ) {
        assert(Number.isInteger(rowLen) && rowLen > 0);
        assert(Number.isInteger(columnLen) && columnLen > 0);
        assert(Number.isInteger(cellSize) && cellSize > 0);

        const [width, height] = [rowLen * cellSize, columnLen * cellSize];

        this._container = new PIXI.Container();

        // контейнер, закрывемый туманом
        this.foggyContainer = new PIXI.Graphics()
            .beginFill(0xff00ff)
            .drawRect(0, 0, width, height);

        const gridColleder = new SquareGridCollider(rowLen, columnLen, cellSize);

        const alphaOnDrag = 0.5;
        const dndLogic = DefaultDnDLogicBuilder.inst.build(gridColleder, alphaOnDrag);

        // drag and drop area
        this.dndArea = new DragAndDropArea(this.foggyContainer, dndLogic);

        // tokens' collection
        this.tokens = Array(Object.keys(TokenLayerType).length / 2)
            .fill(null)
            .map((_, i) => {
                const layer = new PIXI.Container();
                layer.name = TokenLayerType[i];
                return layer;
            });
        this.foggyContainer.addChild(...this.tokens);

        // fog of war
        this.barrierRT = PIXI.RenderTexture.create({ width, height });
        this.fogOfWarRT = PIXI.RenderTexture.create({ width, height });

        const uniforms: FogOfWarShaderUniforms = {
            uObserverAmount: 0,
            uObserverPosList: [0, 0],
            uObserverRadiusList: [0],
            uBarrierTex: this.barrierRT,
        };

        this.fogOfWarShader = new PIXI.Filter(
            resources.vertDefault.data,
            resources.fragFogOfWar.data,
            uniforms
        );

        this.fogOfWarSprite = new PIXI.Sprite(this.fogOfWarRT);
        this.fogOfWarSprite.name = 'fogOfWarSprite';
        this.fogOfWarSprite.filters = [this.fogOfWarShader];

        this.fogMaskSprite = new PIXI.Sprite(this.fogOfWarRT);
        this.fogMaskSprite.name = 'fogScreenSprite';
        this._container.addChild(this.fogMaskSprite);

        this.foggyContainer.mask = this.fogMaskSprite;
        this._container.addChild(this.foggyContainer);

        // grid
        this.grid = new SquareGridView(this._container, gridColleder);
    }

    static async create(
        rowLen: number,
        columnLen: number,
        cellSize: number
    ): Promise<PixiScene> {
        const logger = ConsoleLogger.inst;

        // loading of shaders sources
        const loader = new PIXI.Loader();
        await new Promise<void>((resolve, reject) => {
            loader
                .add('vertDefault', 'glsl/default.vert')
                .add('fragFieldOfView', 'glsl/field_of_view.frag')
                .add('fragFogOfWar', 'glsl/fog_of_war.frag');

            type Resources = {
                vertDefault: PIXI.LoaderResource;
                fragFogOfWar: PIXI.LoaderResource;
            };
            loader.onComplete.add((_loader: PIXI.Loader, resources: Resources) => {
                logger.info('async init:', resources);
                resolve();
            });
            loader.onError.add((_loader, err) => {
                logger.err('async init:', err);
                reject(err);
            });

            loader.load();
        });

        return new PixiScene(rowLen, columnLen, cellSize, loader.resources);
    }

    changeLayer(layer: TokenLayerType): void {
        this.logger.info(
            `change layer ${TokenLayerType[this.layerType]} to ${TokenLayerType[layer]}`
        );

        this.layerType = layer;

        this.foggyContainer.mask =
            layer === TokenLayerType.PLAYER ? this.fogMaskSprite : null;

        switch (layer) {
            case TokenLayerType.BACKGROUND:
                break;
            case TokenLayerType.BARRIER:
                break;
            case TokenLayerType.PLAYER:
                break;
            default:
                throw new Error(`undexpected ${typeof TokenLayerType}`);
        }
    }

    render(renderer: PIXI.Renderer): void {
        if (this.layerType === TokenLayerType.PLAYER) {
            const visibilityRange = 5.5 * this.cellSize;

            const observers = this.tokens[TokenLayerType.PLAYER].children;

            const uniforms: FogOfWarShaderUniforms = this.fogOfWarShader.uniforms;
            uniforms.uObserverAmount = observers.length;
            if (observers.length > 0) {
                uniforms.uObserverPosList = observers.flatMap(({ x, y }) => [
                    x + this.cellSize * 0.5,
                    y + this.cellSize * 0.5,
                ]);
                uniforms.uObserverRadiusList = observers.map((_) => visibilityRange);
            }

            renderer.render(this.tokens[TokenLayerType.BARRIER], this.barrierRT, true);
            renderer.render(this.fogOfWarSprite, this.fogOfWarRT, false);
        }
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

        this.grid.redraw();
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

        this.dndArea.attach(sprite);
        this.layer.addChild(sprite);

        return true;
    }

    removeToken(name: string): boolean {
        const token: PIXI.DisplayObject | null = this.layer.getChildByName(name);
        if (token) {
            this.dndArea.detach(token);
            this.layer.removeChild(token);
        }
        return token != null;
    }

    hasToken(name: string): boolean {
        return this.layer.getChildByName(name) != null;
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

    private get layer(): PIXI.Container {
        return this.tokens[this.layerType];
    }
}
