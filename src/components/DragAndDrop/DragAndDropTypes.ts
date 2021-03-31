export const DraggableType = {
    LOADED_IMAGE: 'LOADED_IMAGE',
    SPRITE: 'SPRITE',
} as const;

export type DraggableType = typeof DraggableType[keyof typeof DraggableType];

export const ContainerType = {
    TABLETOP: 'TABLETOP',
} as const;

export type ContainerType = typeof ContainerType[keyof typeof ContainerType];
