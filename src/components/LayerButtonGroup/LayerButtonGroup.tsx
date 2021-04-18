import { useCallback } from 'react';
import { Layer } from '../GameBoardView/GameBoardView';

interface LayerButtonGroupProps {
    activeLayer: Layer;
    buttonValuesMap: { label: string; value: Layer }[];
    onButtonClick: (layer: Layer) => void;
}

export default function LayerButtonGroup({
    activeLayer,
    buttonValuesMap,
    onButtonClick,
}: LayerButtonGroupProps) {
    const onLayerButtonClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault();
            const button = e.currentTarget;
            const layer = Layer[button.value as keyof typeof Layer];
            onButtonClick(layer);
        },
        [onButtonClick]
    );

    return (
        <div className='p-0 d-flex flex-column' id='layers_buttons'>
            <div className='p-2'></div>
            <div className='btn-group'>
                {buttonValuesMap.map(({ label, value }) => {
                    const activeClassStyle = value === activeLayer ? ' active' : '';
                    return (
                        <button
                            key={value}
                            value={Layer[value]}
                            className={'btn btn-outline-warning' + activeClassStyle}
                            onClick={onLayerButtonClick}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
