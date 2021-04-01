export const DraggableType = {
    LOADED_IMAGE: 'LOADED_IMAGE',
    SPRITE: 'SPRITE',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentionally naming the variable the same as the type
export type DraggableType = typeof DraggableType[keyof typeof DraggableType];

export const ContainerType = {
    TABLETOP: 'TABLETOP',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentionally naming the variable the same as the type
export type ContainerType = typeof ContainerType[keyof typeof ContainerType];
