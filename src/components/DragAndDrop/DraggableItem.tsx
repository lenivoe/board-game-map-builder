import React, { memo, ReactNode } from 'react';
import { useDrag } from 'react-dnd';
import { DraggableType } from './DragAndDropTypes';

interface DraggableItemProps<T> {
    data: T;
    draggable: DraggableType;
    children?: ReactNode;
}

const DraggableItem = memo(<T,>({ data, draggable, children }: DraggableItemProps<T>) => {
    const [isDragging, draggableRef] = useDrag({
        type: draggable,
        item: { data: data },
        collect: (monitor) => monitor.isDragging(),
    });

    return (
        <div
            ref={draggableRef}
            role={draggable}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            className='d-flex flex-row'
        >
            {children}
        </div>
    );
});

export default DraggableItem;
