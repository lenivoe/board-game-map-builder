import './App.scss';

import assert from 'assert';
import React, { useCallback, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import GameBoardView, { TokenInfo } from './GameBoardView/GameBoardView';
import PreviewItem from './PreviewItem/PreviewItem';
import { DraggableType, ContainerType } from './DragAndDrop/DragAndDropTypes';
import ImageBasket from './DragAndDrop/ImageBasket';
import SpriteBasket from './DragAndDrop/SpriteBasket';
import DraggableItem from './DragAndDrop/DraggableItem';

import { ImageDataList } from '../test_data';

export default function App() {
    // images from the files
    const [{ imageMap }, setImageMap] = useState(() => {
        const map = new Map<number, { name: string; url: string }>();
        map.set(0, {
            name: 'карга миниатюра',
            url: ImageDataList.hag,
        });
        map.set(1, {
            name: 'копейщик',
            url: ImageDataList.lancer,
        });
        map.set(2, {
            name: map.get(0)!.name + ' (1)',
            url: map.get(0)!.url,
        });
        map.set(3, {
            name: map.get(1)!.name + ' (1)',
            url: map.get(1)!.url,
        });
        map.set(4, {
            name: map.get(0)!.name + ' (2)',
            url: map.get(0)!.url,
        });
        map.set(5, {
            name: map.get(1)!.name + ' (2)',
            url: map.get(1)!.url,
        });
        return { imageMap: map };
    });

    // images on the game map
    const [{ spriteMap }, setSpriteMap] = useState({
        spriteMap: new Map<number, TokenInfo>(),
    });

    // nextId генерирует очередной id для изображения
    // чем позже была загружена картинка, тем больше ее id
    const [nextId] = useState(() => ((id) => () => id++)(0));

    // добавляет изображение в коллекцию
    // имя равно "<имя без расширения>"
    // или "<имя без расширения> (<число>)"
    const onFileLoadComplete = useCallback(
        (name: string, url: string) => {
            // удаляет расширение файла
            name = name.replace(/\.[^/.]+$/, '');

            // в случае, если изображение с таким именем существует,
            // у нового изображения имя будет с числом в круглых скобках
            const numRegex = new RegExp(`^${name}(?:\\s\\((\\d+)\\))?$`);
            const num = [...imageMap.values()]
                .map((val) => {
                    const res = val.name.match(numRegex);
                    return !res ? 0 : !res[1] ? 1 : parseInt(res[1], 10) + 1;
                })
                .reduce((maxVal, val) => Math.max(maxVal, val), 0);
            const imgName = name + (num === 0 ? '' : ` (${num})`);

            imageMap.set(nextId(), { name: imgName, url });
            setImageMap({ imageMap });
        },
        [nextId, imageMap]
    );

    // при удалении превьюшки картинки из списка на странице
    // картинка удаляется из коллекции
    const onImgPreviewDelete = useCallback(
        (id: number) => {
            assert(imageMap.has(id));

            for (let [spriteId, { imgId }] of spriteMap) {
                if (imgId === id) {
                    spriteMap.delete(spriteId);
                }
            }
            imageMap.delete(id);
            setImageMap({ imageMap: imageMap });
        },
        [imageMap]
    );

    // при перетаскивании превьшки на игровую карту
    // картинка добавляется в коллекцию спрайтов,
    // чтобы позже появиться на игровом поле
    const onDropImgPreviewToMap = useCallback(
        (x: number, y: number, { imgId }: { imgId: number }) => {
            assert(imageMap.get(imgId) != null);

            const { name, url } = imageMap.get(imgId)!;

            // дублирующиеся спрайты отличаются числом в угловых скобках
            const numRegex = new RegExp(`^(?:<(\\d+)>\\s)?${name.replace(/\((\d+)\)/, '\\($1\\)')}$`);
            const num = [...spriteMap.values()]
                .map((val) => {
                    const res = val.name.match(numRegex);
                    return !res ? 0 : !res[1] ? 1 : parseInt(res[1], 10) + 1;
                })
                .reduce((maxVal, val) => Math.max(maxVal, val), 0);

            const tokenInfo: TokenInfo = { name: `<${num}> ${name}`, x, y, imgId, url };

            spriteMap.set(nextId(), tokenInfo);
            setSpriteMap({ spriteMap });
        },
        [nextId, imageMap, spriteMap]
    );

    // при удалении превьюшки спрайта из соответствующего списка на странице
    // он будет удален из коллекции спрайтов,
    // что приведет к его удалению с игрового поля
    const onSpritePreviewDelete = useCallback(
        (id: number) => {
            assert(spriteMap.has(id));
            spriteMap.delete(id);
            setSpriteMap({ spriteMap });
        },
        [spriteMap]
    );

    return (
        <div className='app'>
            <DndProvider backend={HTML5Backend}>
                <Row>
                    <Col xs='auto' sm={3}>
                        <Tabs defaultActiveKey='images' transition={false} id='left-bar'>
                            <Tab eventKey='images' title='Images'>
                                <ImageBasket onFileLoadComplete={onFileLoadComplete}>
                                    ↓↓↓ drop images here ↓↓↓
                                    {[...imageMap.entries()]
                                        .sort(([idLeft], [idRight]) => idLeft - idRight)
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
                                                    onDelete={onImgPreviewDelete}
                                                />
                                            </DraggableItem>
                                        ))}
                                </ImageBasket>
                            </Tab>

                            <Tab eventKey='sprites' title={`Sprites (${spriteMap.size})`}>
                                {[...spriteMap.entries()]
                                    .sort(([idLeft], [idRight]) => idLeft - idRight)
                                    .map(([id, { name, url }]) => (
                                        <PreviewItem
                                            key={id}
                                            id={id}
                                            name={name}
                                            url={url}
                                            onDelete={onSpritePreviewDelete}
                                        />
                                    ))}
                            </Tab>
                        </Tabs>
                    </Col>

                    <SpriteBasket
                        onSpriteDrop={onDropImgPreviewToMap}
                        draggable={DraggableType.LOADED_IMAGE}
                        container={ContainerType.TABLETOP}
                    >
                        <GameBoardView spriteMap={spriteMap} />
                    </SpriteBasket>
                </Row>
            </DndProvider>
        </div>
    );
}
