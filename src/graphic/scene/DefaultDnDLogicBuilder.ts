import IGridCollider from '../grid/collider/IGridCollider';
import MoveAndScaleLogic from '../dragAndDrop/DragLogic/MoveAndScaleLogic';
import ColorAlphaLogic from '../dragAndDrop/DragLogic/ColorAlphaLogic';
import CompositeLogic from '../dragAndDrop/DragLogic/CompositeLogic';
import GridSnapLogic from '../dragAndDrop/DragLogic/GridSnapLogic';
import IDragLogic from '../dragAndDrop/DragLogic/IDragLogic';

export default class DefaultDnDLogicBuilder {
    static get inst(): DefaultDnDLogicBuilder {
        if (!DefaultDnDLogicBuilder._inst) {
            DefaultDnDLogicBuilder._inst = new DefaultDnDLogicBuilder();
        }
        return DefaultDnDLogicBuilder._inst;
    }

    build(grid: IGridCollider, alphaOnDrag: number): IDragLogic {
        return new CompositeLogic(
            new GridSnapLogic(new MoveAndScaleLogic(), grid),
            new ColorAlphaLogic(alphaOnDrag)
        );
    }

    private constructor() {}
    private static _inst?: DefaultDnDLogicBuilder;
}
