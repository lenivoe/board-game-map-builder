import assert from 'assert';
import React, { useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { DraggableType, ContainerType } from './DragAndDropTypes';

interface SpriteBasketProps<T> {
    /**
     * @param x - x of local left-top corner of an area for the sprites
     * @param y - y of local left-top corner of an area for the sprites
     * @param data - some data of draggable item
     */
    onSpriteDrop?: (x: number, y: number, data: T) => void;
    draggable: DraggableType;
    container: ContainerType;
    children?: React.ReactNode;
}

export default function SpriteBasket<T>(props: SpriteBasketProps<T>) {
    const basketRef = useRef<HTMLElement>();

    const [{ isOver }, droppableRef] = useDrop({
        accept: props.draggable,
        drop: (item: { data: T; type: string }, monitor) => {
            assert(basketRef.current);
            assert(monitor.getClientOffset());

            const { x: basketX, y: basketY } = basketRef.current!.getBoundingClientRect();
            const { x: globalX, y: globalY } = monitor.getClientOffset()!;

            const x = globalX - basketX;
            const y = globalY - basketY;

            props.onSpriteDrop?.(x, y, item.data);
        },
        collect: (monitor) => ({ isOver: monitor.isOver() }),
    });

    const setBasket = useCallback(
        (element: HTMLElement | null) => {
            basketRef.current = element!;
            droppableRef(element);
        },
        [basketRef, droppableRef]
    );

    return (
        <div
            ref={setBasket}
            role={props.container}
            style={{
                position: 'relative',
                backgroundColor: isOver ? '#aa0000' : '#00aa00',
                minWidth: '70vw',
                minHeight: '100vh',
            }}
        >
            {props.children}
        </div>
    );
}
