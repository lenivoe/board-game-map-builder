import './GameBoardView.scss';

import { useCallback, useEffect, useRef, useState } from 'react';
import PixiApp from '../../graphic/PixiApp';
import { PixiScene } from '../../graphic/PixiScene';
import assert from 'assert';

export interface TokenInfo {
    name: string;
    x: number;
    y: number;
    imgId: number;
    url: string;
}

interface GameBoardViewProps {
    spriteMap: Map<number, TokenInfo>;
}

export default function GameBoardView({ spriteMap }: GameBoardViewProps) {
    const [spriteIdList, setSpriteIdList] = useState<number[]>([]);

    // инициализация экземпляром PixiApp только после прогрузки страницы
    const pixiAppRef = useRef<PixiApp>();
    const createGameBoard = useCallback((element: HTMLElement | null) => {
        if (element != null && pixiAppRef.current == null && element.clientHeight !== 0) {
            const rowCellsAmount = 15;
            const columnCellsAmount = 10;
            const cellSizeInPixels = 50;
            const scene = new PixiScene(rowCellsAmount, columnCellsAmount, cellSizeInPixels);
            pixiAppRef.current = new PixiApp(element, scene);
        }
    }, []);

    // pixi app init
    // первая половина выполнится единожды после инициализации pixiAppRef
    // вторая перед уничтожением компонента
    useEffect(() => {
        assert(pixiAppRef.current != null);

        const pixiApp = pixiAppRef.current;
        const onWindowResize = () => {
            pixiApp.resize(pixiApp.root.clientWidth, pixiApp.root.clientHeight);
        };
        window.addEventListener('resize', onWindowResize);

        return () => {
            pixiAppRef.current = undefined;
            window.removeEventListener('resize', onWindowResize);
            pixiApp.close();
        };
    }, []);

    // sprites update
    useEffect(() => {
        if (pixiAppRef.current != null) {
            const pixiApp = pixiAppRef.current;

            // удалить старые спрайты
            spriteIdList
                .filter((id) => !spriteMap.has(id))
                .forEach((id) => pixiApp.removeImageIfExist(`${id}`));

            // добавить новые спрайты
            for (const [id, info] of spriteMap) {
                if (!spriteIdList.find((oldId) => oldId === id)) {
                    const pixiSpriteName = `${id}`;
                    pixiApp.addImageIfMissing(pixiSpriteName, info.url, info.x, info.y);
                }
            }

            // обновить список используемых на карте спрайтов
            setSpriteIdList([...spriteMap.keys()]);
        }
    }, [spriteMap, spriteMap.size, spriteIdList]);

    return <div ref={createGameBoard} className='PixiMapView' />;
}