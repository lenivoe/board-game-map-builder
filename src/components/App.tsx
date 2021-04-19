import './App.scss';

import assert from 'assert';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import GameBoardView, { Layer, TokenInfo } from './GameBoardView/GameBoardView';
import PreviewItem from './PreviewItem/PreviewItem';
import { DraggableType, ContainerType } from './DragAndDrop/DragAndDropTypes';
import ImageBasket from './DragAndDrop/ImageBasket';
import SpriteBasket from './DragAndDrop/SpriteBasket';
import DraggableItem from './DragAndDrop/DraggableItem';

import FileReaderAsync from '../common/FileReaderAsync';
import LayerButtonGroup from './LayerButtonGroup/LayerButtonGroup';

/**
 * nextId генерирует очередной id для изображения.
 * чем позже была загружена картинка, тем больше ее id
 */
const nextId = ((id) => () => id++)(0);

export default class App extends React.Component<{}, { activeLayer: Layer }> {
    private readonly imageMap: Map<number, { name: string; url: string }>;
    private readonly spriteMap: Map<number, TokenInfo>[];
    private readonly buttonValuesMap: { label: string; value: Layer }[];

    constructor(props: {}) {
        super(props);

        this.state = { activeLayer: Layer.PLAYER };

        this.imageMap = new Map<number, { name: string; url: string }>();

        this.spriteMap = Array(Object.keys(Layer).length / 2)
            .fill(null)
            .map(() => new Map<number, TokenInfo>());

        this.buttonValuesMap = [
            { label: 'Слой Фона', value: Layer.BACKGROUND },
            { label: 'Слой Карты', value: Layer.BARRIER },
            { label: 'Слой Героев', value: Layer.PLAYER },
        ];
    }

    /** test: init of imageMap */
    async componentDidMount() {
        const paths = [
            ...[...Array(5)].map((_, i) => `token_examples/size64/token_${i + 1}.png`),
            'token_examples/ForestPathPublic.jpg',
            'token_examples/wall1.png',
            'token_examples/wall2.png',
        ];
        const base64Promises = paths.map((name) => FileReaderAsync.readFromUrl(name));

        const base64List = await Promise.all(base64Promises);

        base64List.forEach((base64, i) => {
            this.imageMap.set(nextId(), {
                name: `token ${i + 1}`,
                url: base64,
            });
        });

        this.forceUpdate();
    }

    /**
     * добавляет изображение в коллекцию
     * имя равно "<имя без расширения>"
     * или "<имя без расширения> (<число>)"
     */
    private readonly onFileLoadComplete = (name: string, url: string) => {
        // удаляет расширение файла
        name = name.replace(/\.[^/.]+$/, '');

        // в случае, если изображение с таким именем существует,
        // у нового изображения имя будет с числом в круглых скобках
        const numRegex = new RegExp(`^${name}(?:\\s\\((\\d+)\\))?$`);
        const num = [...this.imageMap.values()]
            .map((val) => {
                const res = val.name.match(numRegex);
                return !res ? 0 : !res[1] ? 1 : parseInt(res[1], 10) + 1;
            })
            .reduce((maxVal, val) => Math.max(maxVal, val), 0);
        const imgName = name + (num === 0 ? '' : ` (${num})`);

        this.imageMap.set(nextId(), { name: imgName, url });

        this.forceUpdate();
    };

    /**
     * при удалении превьюшки картинки из списка на странице
     * картинка удаляется из коллекции
     */
    private readonly onImgPreviewDelete = (id: number) => {
        assert(this.imageMap.has(id));

        const sprites = this.spriteMap[this.state.activeLayer];

        for (let [spriteId, { imgId }] of sprites) {
            if (imgId === id) {
                sprites.delete(spriteId);
            }
        }
        this.imageMap.delete(id);

        this.forceUpdate();
    };

    /**
     * при перетаскивании превьшки на игровую карту
     * картинка добавляется в коллекцию спрайтов,
     * чтобы позже появиться на игровом поле
     */
    private readonly onDropImgPreviewToMap = (
        x: number,
        y: number,
        { imgId }: { imgId: number }
    ) => {
        assert(this.imageMap.get(imgId) != null);

        const sprites = this.spriteMap[this.state.activeLayer];
        const { name, url } = this.imageMap.get(imgId)!;

        // вычисление имени спрайта
        // дублирующиеся спрайты отличаются числом в угловых скобках
        const numRegex = new RegExp(
            `^(?:<(\\d+)>\\s)?${name.replace(/\((\d+)\)/, '\\($1\\)')}$`
        );
        const num = [...sprites.values()]
            .map((val) => {
                const res = val.name.match(numRegex);
                return !res ? 0 : !res[1] ? 1 : parseInt(res[1], 10) + 1;
            })
            .reduce((maxVal, val) => Math.max(maxVal, val), 0);

        const tokenInfo: TokenInfo = { name: `<${num}> ${name}`, x, y, imgId, url };
        sprites.set(nextId(), tokenInfo);

        this.forceUpdate();
    };

    /**
     * при удалении превьюшки спрайта из соответствующего списка на странице
     * он будет удален из коллекции спрайтов,
     * что приведет к его удалению с игрового поля
     */
    private readonly onSpritePreviewDelete = (id: number) => {
        const sprites = this.spriteMap[this.state.activeLayer];

        assert(sprites.has(id));

        sprites.delete(id);
        this.forceUpdate();
    };

    render() {
        const sprites = this.spriteMap[this.state.activeLayer];
        return (
            <div className='app'>
                <DndProvider backend={HTML5Backend}>
                    <Row>
                        <Col xs='auto' sm={3}>
                            <Tabs
                                defaultActiveKey='images'
                                transition={false}
                                id='left-bar'
                            >
                                <Tab eventKey='images' className='ttab' title='Images'>
                                    <ImageBasket
                                        onFileLoadComplete={this.onFileLoadComplete}
                                    >
                                        ↓↓↓ drop images here ↓↓↓
                                        {[...this.imageMap.entries()]
                                            .sort(
                                                ([idLeft], [idRight]) => idLeft - idRight
                                            )
                                            .map(([id, { name, url }]) => (
                                                <DraggableItem
                                                    key={id}
                                                    draggable={DraggableType.LOADED_IMAGE}
                                                    data={{ imgId: id }}
                                                >
                                                    <PreviewItem
                                                        id={id}
                                                        name={name}
                                                        url={url}
                                                        onDelete={this.onImgPreviewDelete}
                                                    />
                                                </DraggableItem>
                                            ))}
                                    </ImageBasket>
                                </Tab>

                                <Tab
                                    eventKey='sprites'
                                    className='ttab'
                                    title={`Sprites (${sprites.size})`}
                                >
                                    {[...sprites.entries()]
                                        .sort(([idLeft], [idRight]) => idLeft - idRight)
                                        .map(([id, { name, url }]) => (
                                            <PreviewItem
                                                key={id}
                                                id={id}
                                                name={name}
                                                url={url}
                                                onDelete={this.onSpritePreviewDelete}
                                            />
                                        ))}
                                </Tab>
                            </Tabs>

                            <LayerButtonGroup
                                buttonValuesMap={this.buttonValuesMap}
                                activeLayer={this.state.activeLayer}
                                onButtonClick={(layer) =>
                                    this.setState({ activeLayer: layer })
                                }
                            />
                        </Col>

                        <SpriteBasket
                            onSpriteDrop={this.onDropImgPreviewToMap}
                            draggable={DraggableType.LOADED_IMAGE}
                            container={ContainerType.TABLETOP}
                        >
                            <GameBoardView
                                spriteMap={this.spriteMap}
                                activeLayer={this.state.activeLayer}
                            />
                        </SpriteBasket>
                    </Row>
                </DndProvider>
            </div>
        );
    }
}
