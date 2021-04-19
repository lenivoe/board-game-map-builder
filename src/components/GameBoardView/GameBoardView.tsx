import './GameBoardView.scss';

// import { useCallback, useEffect, useRef, useState } from 'react';
import PixiApp from '../../graphic/PixiApp';
import PixiScene from '../../graphic/scene/PixiScene';
import { TokenLayerType } from '../../graphic/scene/IPixiScene';
import DefaultLoggerBuilder from '../../graphic/DefaultLoggerBuilder';
import React from 'react';
import assert from 'assert';

export enum Layer {
    BACKGROUND = 0,
    BARRIER,
    PLAYER,
}

export interface TokenInfo {
    name: string;
    x: number;
    y: number;
    imgId: number;
    url: string;
}

interface Props {
    spriteMap: Map<number, TokenInfo>[];
    activeLayer: Layer;
}

export default class GameBoardView extends React.Component<Props> {
    logger = DefaultLoggerBuilder.inst.build(this);

    private pixiRoot!: HTMLElement;
    private pixiApp: PixiApp | null = null;
    private prevSpriteMap: Props['spriteMap'];

    constructor(props: Props) {
        super(props);
        // для отслеживания измненеия в коллекции картинок
        this.prevSpriteMap = this.props.spriteMap.map((sprites) => new Map(sprites));
    }

    async componentDidMount() {
        assert(this.pixiRoot);

        // создание сцены
        const rowCellsAmount = 24;
        const columnCellsAmount = 20;
        const cellSizeInPixels = 64;

        const scene = await PixiScene.create(
            rowCellsAmount,
            columnCellsAmount,
            cellSizeInPixels
        );

        // создание экземпляра pixi приложения
        this.pixiApp = new PixiApp(this.pixiRoot, scene);

        window.addEventListener('resize', this.onWindowResize);
    }

    componentWillUnmount() {
        this.pixiApp?.close();
        window.removeEventListener('resize', this.onWindowResize);
    }

    componentDidUpdate() {
        if (this.pixiApp) {
            this.changeLayer();
            this.updateSprites();
        }
    }

    render() {
        return <div ref={this.createGameBoard} className='game_board_view' />;
    }

    private readonly createGameBoard = (root: HTMLElement | null) => {
        if (root != null && root.clientHeight > 0 && root.clientWidth > 0) {
            this.pixiRoot = root;
        }
    };

    private updateSprites() {
        const pixiApp = this.pixiApp!;
        const sprites = this.props.spriteMap[this.props.activeLayer];
        const prevSprites = this.prevSpriteMap[this.props.activeLayer];

        // удалить старые спрайты из pixiApp и из истории
        for (const [oldId, oldInfo] of prevSprites) {
            if (!sprites.has(oldId)) {
                pixiApp.removeImageIfExist(oldInfo.name);
                prevSprites.delete(oldId);
            }
        }

        // добавить новые спрайты в pixiApp и записать их в историю
        for (const [id, info] of sprites) {
            if (!prevSprites.has(id)) {
                pixiApp.addImageIfMissing(info.name, info.url, info.x, info.y);
                prevSprites.set(id, info);
            }
        }
    }

    private changeLayer() {
        let layer: TokenLayerType;

        switch (this.props.activeLayer) {
            case Layer.BACKGROUND:
                layer = TokenLayerType.BACKGROUND;
                break;
            case Layer.BARRIER:
                layer = TokenLayerType.BARRIER;
                break;
            case Layer.PLAYER:
                layer = TokenLayerType.PLAYER;
                break;
            default:
                this.logger.err('unexpected active layer:', this.props.activeLayer);
                return;
        }

        this.pixiApp!.changeLayer(layer);
    }

    private readonly onWindowResize = () => {
        if (this.pixiApp) {
            const { clientWidth, clientHeight } = this.pixiRoot;
            this.pixiApp.resize(clientWidth, clientHeight);
        }
    };
}
