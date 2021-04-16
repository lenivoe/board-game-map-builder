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
        <div className='container p-1'>
            <div className='row'>
                {/* Image */}
                <div className='col p-0 col-5 col-lg-6 col-xl-4'>
                    <img
                        src={url}
                        alt={name}
                        style={{ maxWidth: '60px', maxHeight: '60px' }}
                    />
                </div>

                {/* Title */}
                <div className='col p-0'>
                    <p className='text-break text-start small'>{name}</p>
                </div>

                {/* Delete button */}
                <div className='col align-self-center p-0 col-2 col-lg-1'>
                    <button
                        onClick={onDeleteButtonClick}
                        className='btn badge rounded-pill btn-danger'
                        // style={{padding: '1'}}
                    >
                        x
                    </button>
                </div>
            </div>
        </div>
    );
});

export default PreviewItem;
