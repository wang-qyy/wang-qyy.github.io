import { getCanvasInfo } from '@/kernel/store';
import {
  AssetClass,
  AssetSizeAndPosition,
  Coordinate,
  Position,
  RectLimit,
} from '@kernel/typing';
import {
  calculateRotatedPointCoordinate,
  getAssetCenterPoint,
} from '@kernel/utils/mouseHandler/mouseHandlerHelper';
import {
  getRectCenter,
  getRectLeftTopByCenterAndSize,
  getRectLimitCoordinate,
  rotatePoint,
} from '@kernel/utils/mouseHandler/reactHelper';
import {
  ResizePoint,
  ResizePointStatic,
} from '@kernel/Components/TransformPoints/handler';
import {
  ChangeType,
  TransformerProps,
} from '@kernel/Components/Transformer/typing';

/**
 * 获取蒙版子元素旋转后的坐标
 */
export function getMaskAssetPositionRotate(editAsset: AssetClass) {
  const { scale } = getCanvasInfo();
  const { assets } = editAsset;
  let { rotate } = editAsset.transform;
  if (rotate < 0) {
    rotate += 360;
  }
  if (assets && editAsset.transform.rotate > 0) {
    const { rt_attribute } = assets[0].tempData;
    // 形状的旋转中心
    const center = getAssetCenterPoint(editAsset, scale);
    // 形状的旋转后的点位
    const resu = calculateRotatedPointCoordinate(
      {
        x: editAsset.transform.posX * scale,
        y: editAsset.transform.posY * scale,
      },
      center,
      editAsset.transform.rotate,
    );
    // 图形的旋转前的中心
    const center3 = getAssetCenterPoint(assets[0], scale);
    // 图形的旋转后的中心
    const center4 = calculateRotatedPointCoordinate(
      center3,
      center,
      editAsset.transform.rotate,
    );
    // 图形的旋转后的点位
    const resu3 = calculateRotatedPointCoordinate(
      { x: resu.x, y: resu.y },
      center4,
      -editAsset.transform.rotate,
    );
    return {
      left: resu3.x + (rt_attribute?.poXDiff || 0) * scale,
      top: resu3.y + (rt_attribute?.poYDiff || 0) * scale,
    };
  }
}

/** 以下方法都是在用的 */
/**
 * 获取已知坐标的的视图坐标
 */
export function getMaskAssetPositionRotateView(
  editAsset: AssetClass,
  position: Position,
  rotate: number,
  scale: number,
) {
  if (editAsset && rotate > 0) {
    // 旋转中心
    const center = getAssetCenterPoint(editAsset, scale);

    // 旋转后的点位
    const resu3 = calculateRotatedPointCoordinate(
      { x: position.left * scale, y: position.top * scale },
      center,
      rotate,
    );
    return {
      left: resu3.x,
      top: resu3.y,
    };
  }
}

/**
 * 获取蒙版子元素旋转后的坐标
 */
export function getMaskAssetPositionRotateDiff(
  editAsset: AssetClass,
  position: Position,
  scale: number,
) {
  const { assets } = editAsset;
  const { rotate } = editAsset.transform;

  if (assets && rotate > 0) {
    // 实际点坐标的视图点
    const currentPositionView = getMaskAssetPositionRotateView(
      assets[0],
      {
        left: position.left,
        top: position.top,
      },
      rotate,
      scale,
    );
    // svg坐标的视图点
    const svgView = getMaskAssetPositionRotateView(
      editAsset,
      {
        left: editAsset.transform.posX,
        top: editAsset.transform.posY,
      },
      rotate,
      scale,
    );
    // @ts-ignore
    const a = Math.abs(currentPositionView.left - svgView?.left);
    // @ts-ignore
    const b = Math.abs(currentPositionView.top - svgView?.top);
    const c = Math.sqrt(a * a + b * b);
    const diff = {
      poXDiff: Math.cos(rotate) * a + Math.sin(rotate) * b,
      poYDiff: Math.cos(rotate) * b - Math.sin(rotate) * a,
    };
    return {
      left: editAsset.transform.posX * scale + (diff?.poXDiff || 0) * scale,
      top: editAsset.transform.posY * scale + (diff?.poYDiff || 0) * scale,
      diff,
    };
  }
}

/**
 * @description 获取限制位置
 * @param maskStyle
 * @param newStyle
 */
export function getMaskAssetLimit(
  maskStyle: AssetSizeAndPosition,
  newStyle: AssetSizeAndPosition,
): RectLimit {
  return {
    xMin: maskStyle.width - newStyle.width,
    xMax: 0,
    yMin: maskStyle.height - newStyle.height,
    yMax: 0,
  };
}

/**
 * @description 判断蒙版与元素发生碰撞
 * @param position 蒙版相对于画布的样式
 * @param limit 裁剪元素相对于画布的样式
 */
export function checkMaskAssetCrossBorder(
  position: Coordinate,
  limit: RectLimit,
) {
  const newPosition = {
    ...position,
  };
  if (newPosition.x > limit.xMax) {
    newPosition.x = limit.xMax;
  }
  if (newPosition.y > limit.yMax) {
    newPosition.y = limit.yMax;
  }

  if (newPosition.x < limit.xMin) {
    newPosition.x = limit.xMin;
  }
  if (newPosition.y < limit.yMin) {
    newPosition.y = limit.yMin;
  }
  return newPosition;
}

export function calcChildAbsoluteByMask(mask: AssetClass, child: AssetClass) {
  const { posX: pLeft, posY: pTop, rotate: pRotate = 0 } = mask.transform;
  let moduleCenter: Coordinate | undefined;
  const hasRotate = pRotate % 360 > 0;
  if (hasRotate) {
    moduleCenter = getRectCenter({
      ...mask.assetSize,
      ...mask.assetPosition,
    });
  }
  const { posX, posY, rotate = 0 } = child.transform;
  const transform = {
    posX: posX + pLeft,
    posY: posY + pTop,
    rotate: rotate + pRotate,
  };
  if (moduleCenter) {
    const center = getRectCenter({
      ...child.containerSize,
      left: transform.posX,
      top: transform.posY,
    });
    const centerRotated = rotatePoint(center, moduleCenter, pRotate);
    const newPos = getRectLeftTopByCenterAndSize(
      child.containerSize,
      centerRotated,
    );
    Object.assign(transform, {
      posX: newPos.x,
      posY: newPos.y,
    });
  }

  return transform;
}

export function calcRectOverBorderMin(
  border: TransformerProps['style'],
  target: TransformerProps['style'],
  resizePoint: ChangeType,
): Partial<RectLimit> {
  const targetRect = getRectLimitCoordinate(target);
  const borderRect = getRectLimitCoordinate(border);
  const scale = target.width / target.height;
  if (resizePoint === 'top') {
    return {
      yMin: borderRect.yMin,
    };
  }
  if (resizePoint === 'right') {
    return {
      xMax: borderRect.xMax,
    };
  }
  if (resizePoint === 'bottom') {
    return {
      yMax: borderRect.yMax,
    };
  }
  if (resizePoint === 'left') {
    return {
      xMin: borderRect.xMin,
    };
  }

  // const leftMinDiff = borderRect.xMin - targetRect.xMin;
  // const topMinDiff = borderRect.yMin - targetRect.yMin;
  // const leftMaxDiff = targetRect.xMax - borderRect.xMax;
  // const topMaxDiff = targetRect.yMax - borderRect.yMax;
  if (resizePoint === 'left_top') {
    const leftMinDiff = borderRect.xMin - targetRect.xMin;
    const topMinDiff = (borderRect.yMin - targetRect.yMin) * scale;

    if (leftMinDiff < topMinDiff) {
      return { xMin: borderRect.xMin };
    }
    return { yMin: borderRect.yMin };
  }

  if (resizePoint === 'right_top') {
    const leftMaxDiff = targetRect.xMax - borderRect.xMax;
    const topMinDiff = (borderRect.yMin - targetRect.yMin) * scale;

    if (leftMaxDiff < topMinDiff) {
      return { xMax: borderRect.xMax };
    }
    return { yMin: borderRect.yMin };
  }

  if (resizePoint === 'right_bottom') {
    const leftMaxDiff = targetRect.xMax - borderRect.xMax;
    const topMaxDiff = (targetRect.yMax - borderRect.yMax) * scale;

    if (leftMaxDiff < topMaxDiff) {
      return { xMax: borderRect.xMax };
    }
    return { yMax: borderRect.yMax };
  }

  if (resizePoint === 'left_bottom') {
    const leftMinDiff = borderRect.xMin - targetRect.xMin;
    const topMaxDiff = (targetRect.yMax - borderRect.yMax) * scale;

    if (leftMinDiff < topMaxDiff) {
      return { xMin: borderRect.xMin };
    }
    return { yMax: borderRect.yMax };
  }

  return {};
}

export function calcRectOverBorderMax(
  border: TransformerProps['style'],
  target: TransformerProps['style'],
  resizePoint: ChangeType,
): Partial<RectLimit> {
  const targetRect = getRectLimitCoordinate(target);
  const borderRect = getRectLimitCoordinate(border);
  const scale = target.width / target.height;
  if (resizePoint === 'top') {
    return {
      yMin: borderRect.yMin,
    };
  }
  if (resizePoint === 'right') {
    return {
      xMax: borderRect.xMax,
    };
  }
  if (resizePoint === 'bottom') {
    return {
      yMax: borderRect.yMax,
    };
  }
  if (resizePoint === 'left') {
    return {
      xMin: borderRect.xMin,
    };
  }

  // const leftMinDiff = targetRect.xMin - borderRect.xMin;
  // const topMinDiff = targetRect.yMin - borderRect.yMin;
  // const leftMaxDiff = borderRect.xMax - targetRect.xMax;
  // const topMaxDiff = borderRect.yMax - targetRect.yMax;

  if (resizePoint === 'left_top') {
    const leftMinDiff = targetRect.xMin - borderRect.xMin;
    const topMinDiff = (targetRect.yMin - borderRect.yMin) * scale;

    if (leftMinDiff < topMinDiff) {
      return { xMin: borderRect.xMin };
    }
    return { yMin: borderRect.yMin };
  }

  if (resizePoint === 'right_top') {
    const leftMaxDiff = borderRect.xMax - targetRect.xMax;
    const topMinDiff = (targetRect.yMin - borderRect.yMin) * scale;

    if (leftMaxDiff < topMinDiff) {
      return { xMax: borderRect.xMax };
    }
    return { yMin: borderRect.yMin };
  }

  if (resizePoint === 'right_bottom') {
    const leftMaxDiff = borderRect.xMax - targetRect.xMax;
    const topMaxDiff = (borderRect.yMax - targetRect.yMax) * scale;

    if (leftMaxDiff < topMaxDiff) {
      return { xMax: borderRect.xMax };
    }
    return { yMax: borderRect.yMax };
  }

  if (resizePoint === 'left_bottom') {
    const leftMinDiff = targetRect.xMin - borderRect.xMin;
    const topMaxDiff = (borderRect.yMax - targetRect.yMax) * scale;

    if (leftMinDiff < topMaxDiff) {
      return { xMin: borderRect.xMin };
    }
    return { yMax: borderRect.yMax };
  }

  return {};
}

export function calcMaxStyle(
  border: TransformerProps['style'],
  target: TransformerProps['style'],
  resizePoint: ChangeType,
  limit: Partial<RectLimit>,
) {
  // @ts-ignore
  const isScale = ResizePointStatic.unLRTB.includes(resizePoint);
  const targetRect = getRectLimitCoordinate(target);
  const borderRect = getRectLimitCoordinate(border);

  if (limit.yMax !== undefined && targetRect.yMax > limit.yMax) {
    const height = borderRect.yMax - targetRect.yMin;
    let width: number;
    if (isScale) {
      const ratio = target.width / target.height;
      width = height * ratio;
    } else {
      width = targetRect.xMax - targetRect.xMin;
    }

    let maxGap: number;
    // 需要区分左右，向左拉伸时，xMax不变，否则xMax跟随鼠标变化
    if (resizePoint.includes('left')) {
      maxGap = borderRect.xMax - targetRect.xMax;
    } else {
      // 因为targetRect.xMax会跟随鼠标变化，所以需要取一个固定点计算
      maxGap = borderRect.xMax - (targetRect.xMin + width);
    }

    const minGap = border.width - maxGap - width;
    const pos = {
      left: borderRect.xMin + minGap,
      top: targetRect.yMin,
    };
    return {
      ...pos,
      width,
      height,
    };
  }

  if (limit.yMin !== undefined && targetRect.yMin < limit.yMin) {
    const height = targetRect.yMax - borderRect.yMin;
    let width: number;

    if (isScale) {
      const ratio = target.width / target.height;
      width = height * ratio;
    } else {
      width = targetRect.xMax - targetRect.xMin;
    }

    let maxGap: number;
    // 需要区分左右，向左拉伸时，xMax不变，否则xMax跟随鼠标变化
    if (resizePoint.includes('left')) {
      maxGap = borderRect.xMax - targetRect.xMax;
    } else {
      // 因为targetRect.xMax会跟随鼠标变化，所以需要取一个固定点计算
      maxGap = borderRect.xMax - (targetRect.xMin + width);
    }

    const minGap = border.width - maxGap - width;
    const pos = {
      left: borderRect.xMin + minGap,
      top: borderRect.yMin,
    };
    return {
      ...pos,
      width,
      height,
    };
  }

  if (limit.xMax !== undefined && targetRect.xMax > limit.xMax) {
    const width = borderRect.xMax - targetRect.xMin;
    let height: number;
    if (isScale) {
      const ratio = target.height / target.width;
      height = width * ratio;
    } else {
      height = targetRect.yMax - targetRect.yMin;
    }

    let maxGap: number;
    // 需要区分左右，向左拉伸时，xMax不变，否则xMax跟随鼠标变化
    if (resizePoint.includes('top')) {
      maxGap = borderRect.yMax - targetRect.yMax;
    } else {
      // 因为targetRect.xMax会跟随鼠标变化，所以需要取一个固定点计算
      maxGap = borderRect.yMax - (targetRect.yMin + height);
    }
    const minGap = border.height - maxGap - height;
    const pos = {
      left: targetRect.xMin,
      top: borderRect.yMin + minGap,
    };

    return {
      ...pos,
      width,
      height,
    };
  }
  if (limit.xMin !== undefined && targetRect.xMin < limit.xMin) {
    const width = targetRect.xMax - borderRect.xMin;
    let height: number;

    if (isScale) {
      const ratio = target.height / target.width;
      height = width * ratio;
    } else {
      height = targetRect.yMax - targetRect.yMin;
    }
    let maxGap: number;
    // 需要区分左右，向左拉伸时，xMax不变，否则xMax跟随鼠标变化
    if (resizePoint.includes('top')) {
      maxGap = borderRect.yMax - targetRect.yMax;
    } else {
      // 因为targetRect.xMax会跟随鼠标变化，所以需要取一个固定点计算
      maxGap = borderRect.yMax - (targetRect.yMin + height);
    }
    const minGap = border.height - maxGap - height;
    const pos = {
      left: borderRect.xMin,
      top: borderRect.yMin + minGap,
    };
    return {
      ...pos,
      width,
      height,
    };
  }
  return target;
}

export function calcMinStyle(
  border: TransformerProps['style'],
  target: TransformerProps['style'],
  resizePoint: ChangeType,
  limit: Partial<RectLimit>,
) {
  // @ts-ignore
  const isScale = ResizePointStatic.unLRTB.includes(resizePoint);
  const targetRect = getRectLimitCoordinate(target);
  const borderRect = getRectLimitCoordinate(border);
  if (limit.yMax && targetRect.yMax < limit.yMax) {
    const height = borderRect.yMax - targetRect.yMin;
    let width: number;
    if (isScale) {
      const ratio = target.width / target.height;
      width = height * ratio;
    } else {
      width = targetRect.xMax - targetRect.xMin;
    }

    let minGap: number;
    // 需要区分左右，向左拉伸时，xMax不变，否则xMax跟随鼠标变化
    if (resizePoint.includes('left')) {
      const maxGap = targetRect.xMax - borderRect.xMax;
      minGap = width - maxGap - border.width;
    } else {
      minGap = borderRect.xMin - targetRect.xMin;
    }

    const pos = {
      left: borderRect.xMin - minGap,
      top: targetRect.yMin,
    };
    return {
      ...pos,
      width,
      height,
    };
  }

  if (limit.yMin && targetRect.yMin > limit.yMin) {
    const height = targetRect.yMax - borderRect.yMin;
    let width: number;

    if (isScale) {
      const ratio = target.width / target.height;
      width = height * ratio;
    } else {
      width = targetRect.xMax - targetRect.xMin;
    }

    let minGap: number;
    // 需要区分左右，向左拉伸时，xMax不变，否则xMax跟随鼠标变化
    if (resizePoint.includes('left')) {
      const maxGap = targetRect.xMax - borderRect.xMax;
      minGap = width - maxGap - border.width;
    } else {
      minGap = borderRect.xMin - targetRect.xMin;
    }

    const pos = {
      left: borderRect.xMin - minGap,
      top: borderRect.yMin,
    };

    return {
      ...pos,
      width,
      height,
    };
  }

  if (limit.xMax && targetRect.xMax < limit.xMax) {
    const width = borderRect.xMax - targetRect.xMin;
    let height: number;
    if (isScale) {
      const ratio = target.height / target.width;
      height = width * ratio;
    } else {
      height = targetRect.xMax - targetRect.xMin;
    }

    let minGap: number;

    if (resizePoint.includes('top')) {
      const maxGap = targetRect.yMax - borderRect.yMax;
      minGap = height - maxGap - border.height;
    } else {
      // 因为targetRect.xMax会跟随鼠标变化，所以需要取一个固定点计算
      minGap = borderRect.yMin - targetRect.yMin;
    }
    const pos = {
      left: targetRect.xMin,
      top: borderRect.yMin - minGap,
    };
    return {
      ...pos,
      width,
      height,
    };
  }

  if (limit.xMin && targetRect.xMin > limit.xMin) {
    const width = targetRect.xMax - borderRect.xMin;
    let height: number;

    if (isScale) {
      const ratio = target.height / target.width;
      height = width * ratio;
    } else {
      height = targetRect.yMax - targetRect.yMin;
    }

    let minGap: number;

    if (resizePoint.includes('top')) {
      const maxGap = targetRect.yMax - borderRect.yMax;
      minGap = height - maxGap - border.height;
    } else {
      // 因为targetRect.xMax会跟随鼠标变化，所以需要取一个固定点计算
      minGap = borderRect.yMin - targetRect.yMin;
    }
    const pos = {
      left: borderRect.xMin,
      top: borderRect.yMin - minGap,
    };
    return {
      ...pos,
      width,
      height,
    };
  }
  return target;
}
