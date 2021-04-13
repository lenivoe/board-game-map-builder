import { DisplayObject, Point } from 'pixi.js';
import DefaultLoggerBuilder from '../../DefaultLoggerBuilder';
import IDragLogic from './IDragLogic';

const cursorStyles = [
    'alias',
    'all-scroll',
    'auto',
    'cell',
    'context-menu',
    'col-resize',
    'copy',
    'crosshair',
    'default',
    'e-resize',
    'ew-resize',
    'help',
    'move',
    'n-resize',
    'ne-resize',
    'nesw-resize',
    'ns-resize',
    'nw-resize',
    'nwse-resize',
    'no-drop',
    'none',
    'not-allowed',
    'pointer',
    'progress',
    'row-resize',
    's-resize',
    'se-resize',
    'sw-resize',
    'text',
    'vertical-text',
    'w-resize',
    'wait',
    'zoom-in',
    'zoom-out',
    'initial',
    'inherit',
];

export default class CursorViewLogic implements IDragLogic {
    logger = DefaultLoggerBuilder.inst.build(this);

    constructor() {}

    onDragStart(draggable: DisplayObject, _globalMousePos: Point): void {
        this.logger.info(
            `onDragStart: token '${draggable.name}' [${draggable.x}, ${draggable.y}]:`
        );

        this.logger.debug('mouse style:', document.body.style.cursor);

        const index = cursorStyles.findIndex((value) => {
            return value === document.body.style.cursor;
        });
        const nextIndex = (index + 1) % cursorStyles.length;
        document.body.style.cursor = cursorStyles[nextIndex];

        this.logger.debug(index, nextIndex);

        this.logger.debug('mouse style:', document.body.style.cursor);
    }
    onDragMove(_draggable: DisplayObject, _globalMousePos: Point): void {}
    onDragEnd(draggable: DisplayObject, _globalMousePos: Point): void {
        this.logger.info(
            `onDragEnd: token '${draggable.name}' [${draggable.x}, ${draggable.y}]:`
        );
    }
}
