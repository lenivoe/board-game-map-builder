import { DisplayObject } from 'pixi.js';
import IGridCollider from '../collider/IGridCollider';

export default interface IGridView {
    collider: IGridCollider;

    redraw(): void;
}
