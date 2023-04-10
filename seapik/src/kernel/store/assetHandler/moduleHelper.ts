import { AssetClass, Coordinate, Transform } from '@/kernel/typing';
import {
  getRectCenter,
  getRectLeftTopByCenterAndSize,
  rotatePoint,
} from '@kernel/utils/mouseHandler/reactHelper';

/**
 * @description 将模板子元素的相对数据转化为相对于画布的绝对定位数据
 * @param asset
 * @param parent
 * @param moduleCenter
 * @param useRtRelative 是否使用rt属性
 */
export function relativeToAbsoluteByTempModule(
  asset: AssetClass,
  parent: AssetClass,
  moduleCenter: Coordinate | undefined,
  useRtRelative = true,
) {
  const { posY: pTop, posX: pLeft, rotate: pRotate = 0 } = parent.transform;
  const { width: pWidth, height: pHeight } = parent.attribute;
  const { rt_relative = { posY: 0, posX: 0, rotate: 0 } } = asset.tempData;
  const { posY, posX, rotate } = useRtRelative ? rt_relative : asset.transform;
  const transform: Partial<Transform> = {};
  const newCoordinate = useRtRelative
    ? {
        x: pLeft + posX * pWidth,
        y: pTop + posY * pHeight,
      }
    : {
        x: pLeft + posX,
        y: pTop + posY,
      };
  // 如果旋转，则根据父元素的中心点旋转
  if (moduleCenter) {
    const center = getRectCenter({
      ...asset.containerSize,
      left: newCoordinate.x,
      top: newCoordinate.y,
    });
    const centerRotated = rotatePoint(center, moduleCenter, pRotate);
    const newPos = getRectLeftTopByCenterAndSize(
      asset.containerSize,
      centerRotated,
    );
    Object.assign(transform, {
      posX: newPos.x,
      posY: newPos.y,
    });
  } else {
    Object.assign(transform, {
      posX: newCoordinate.x,
      posY: newCoordinate.y,
    });
  }
  transform.rotate = rotate + pRotate;
  return transform;
}

export function relativeToAbsoluteByModule(
  asset: AssetClass,
  parent: AssetClass,
) {
  const { width: pWidth, height: pHeight } = parent.attribute;
  const { rt_relative } = asset.tempData;
  const { posY = 0, posX = 0 } = rt_relative || {};
  const transform: Partial<Transform> = {
    posX: posX * pWidth,
    posY: posY * pHeight,
  };

  return transform;
}
