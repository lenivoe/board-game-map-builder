import React, { useCallback } from 'react';

interface PreviewItemProps {
    id: number;
    name: string;
    url: string;
    onDelete?: (id: number) => void;
}

const PreviewItem = React.memo(({ id, name, url, onDelete }: PreviewItemProps) => {
    const onDeleteButtonClick = useCallback(() => onDelete?.(id), [id, onDelete]);

    return (
        <div className='d-flex flex-row bd-highlight mb-3 w-100'>
            {/* Image */}
            <div className='bd-highlight w-25 align-self-center'>
                <img
                    src={url}
                    alt={name}
                    style={{ maxWidth: '60px', maxHeight: '60px' }}
                />
            </div>

            {/* Title */}
            <div className='p-2 flex-grow-1 bd-highlight align-self-center'>
                <p className='text-break text-start small'>{name}</p>
            </div>

            {/* Delete button */}
            <div className='bd-highlight align-self-center'>
                <button
                    onClick={onDeleteButtonClick}
                    className='btn badge rounded-pill btn-danger'
                >
                    x
                </button>
            </div>
        </div>
    );
});

export default PreviewItem;
