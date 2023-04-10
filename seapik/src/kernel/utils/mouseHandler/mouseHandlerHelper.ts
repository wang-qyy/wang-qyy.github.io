import type { ResizePoint } from '@kernel/Components/TransformPoints/handler';
import {
  Asset,
  Coordinate,
  Position,
  AssetBaseSize,
  AssetClass,
} from '@kernel/typing';
import { BaseSize } from '@kernel/utils/mouseHandler/index';

// 求两点之间的中点坐标
export function getCenterPoint(current: Coordinate, origin: Coordinate) {
  return {
    x: origin.x + (current.x - origin.x) / 2,
    y: origin.y + (current.y - origin.y) / 2,
  };
}

/**
 * @description 获取asset元素的中心点坐标
 * @param position 元素左上角坐标
 * @param size 元素宽高
 * @param reverse  翻转，通过中心点坐标和宽高获取左上角坐标
 */
export function getCenterPointFromSize(
  position: Coordinate | Position,
  size: AssetBaseSize,
  reverse = false,
) {
  let left = 0;
  let top = 0;
  if ((position as Position).top) {
    left = (position as Position).left;
    top = (position as Position).top;
  }
  if ((position as Coordinate)?.x) {
    left = (position as Coordinate).x;
    top = (position as Coordinate).y;
  }
  const { width, height } = size;
  if (reverse) {
    return {
      x: left - width / 2,
      y: top - height / 2,
    };
  }
  return {
    x: left + width / 2,
    y: top + height / 2,
  };
}

export function getAssetCenterPoint(asset: Asset | AssetClass, scale = 1) {
  const { transform, attribute } = asset;
  return getCenterPointFromSize(
    {
      x: transform.posX * scale,
      y: transform.posY * scale,
    },
    {
      width: attribute.width * scale,
      height: attribute.height * scale,
    },
  );
}

export function coordinateToPosition(coordinate: Coordinate) {
  return {
    left: coordinate.x,
    top: coordinate.y,
  };
}

export function positionToCoordinate(position: Position) {
  return {
    x: position.left,
    y: position.top,
  };
}

/**
 * @description 计算元素所有坐标点
 */
export class AssetCoordinate {
  static coordinateToPosition = coordinateToPosition;

  static positionToCoordinate = positionToCoordinate;

  center: Coordinate;

  size: AssetBaseSize;

  originSize: AssetBaseSize;

  originPosition: Position;

  leftTop: Coordinate;

  rightTop: Coordinate;

  leftBottom: Coordinate;

  rightBottom: Coordinate;

  leftCenter: Coordinate;

  topCenter: Coordinate;

  rightCenter: Coordinate;

  bottomCenter: Coordinate;

  constructor(size: AssetBaseSize, position: Position, scale: number) {
    const width = size.width * scale;
    const height = size.height * scale;
    const left = position.left * scale;
    const top = position.top * scale;
    this.size = {
      width,
      height,
    };
    this.originSize = size;
    this.originPosition = position;
    this.center = {
      x: left + width / 2,
      y: top + height / 2,
    };
    this.leftTop = {
      x: left,
      y: top,
    };
    this.rightTop = {
      x: left + width,
      y: top,
    };
    this.leftBottom = {
      x: left,
      y: top + height,
    };
    this.rightBottom = {
      x: left + width,
      y: top + height,
    };
    this.leftCenter = {
      x: this.leftTop.x,
      y: this.center.y,
    };
    this.topCenter = {
      x: this.center.x,
      y: this.leftTop.y,
    };
    this.rightCenter = {
      x: this.rightTop.x,
      y: this.center.y,
    };
    this.bottomCenter = {
      x: this.center.x,
      y: this.leftBottom.y,
    };
  }
}

// 角度转弧度
// Math.PI = 180 度
function angleToRadian(angle: number) {
  return (angle * Math.PI) / 180;
}

/**
 * 计算根据圆心旋转后的点的坐标
 * @param   {Object}  point  旋转前的点坐标
 * @param   {Object}  center 旋转中心
 * @param   {Number}  rotate 旋转的角度
 * @return  {Object}         旋转后的坐标
 * https://www.zhihu.com/question/67425734/answer/252724399 旋转矩阵公式
 */
export function calculateRotatedPointCoordinate(
  point: Coordinate,
  center: Coordinate,
  rotate: number,
) {
  /**
   * 旋转公式：
   *  点a(x, y)
   *  旋转中心c(x, y)
   *  旋转后点n(x, y)
   *  旋转角度θ                tan ??
   * nx = cosθ * (ax - cx) - sinθ * (ay - cy) + cx
   * ny = sinθ * (ax - cx) + cosθ * (ay - cy) + cy
   */
  if (Math.abs(rotate) % 360 === 0) {
    return { ...point };
  }
  const radian = angleToRadian(rotate);
  const cosRadian = Math.cos(radian);
  const sinRadian = Math.sin(radian);
  const disX = point.x - center.x;
  const disY = point.y - center.y;
  return {
    x: disX * cosRadian - disY * sinRadian + center.x,
    y: disX * sinRadian + disY * cosRadian + center.y,
  };
}

function getBaseStyle() {
  return {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  };
}

interface CalculateParams {
  rotate: number;
  // 当前移动的坐标点
  currentPosition: Coordinate;
  symmetricPoint: Coordinate;
  size: AssetBaseSize;
  prevDistance: BaseSize;
  // 移动点的初始坐标
  movePointOrigin: Coordinate;
  proportion?: number;
}

type Handler = (
  calculateParams: CalculateParams,
) => ReturnType<typeof getBaseStyle>;

function calculateLeftTop({
  rotate,
  currentPosition,
  symmetricPoint,
  proportion,
  prevDistance,
}: CalculateParams) {
  const style = getBaseStyle();
  const negateRotate = -rotate;

  let newCenterPoint = getCenterPoint(currentPosition, symmetricPoint);
  let newTopLeftPoint = calculateRotatedPointCoordinate(
    currentPosition,
    newCenterPoint,
    negateRotate,
  );
  let newBottomRightPoint = calculateRotatedPointCoordinate(
    symmetricPoint,
    newCenterPoint,
    negateRotate,
  );

  let newWidth = newBottomRightPoint.x - newTopLeftPoint.x;
  let newHeight = newBottomRightPoint.y - newTopLeftPoint.y;

  if (typeof proportion === 'number') {
    if (newWidth / newHeight > proportion) {
      newTopLeftPoint.x += Math.abs(newWidth - newHeight * proportion);
      newWidth = newHeight * proportion;
    } else {
      newTopLeftPoint.y += Math.abs(newHeight - newWidth / proportion);
      newHeight = newWidth / proportion;
    }

    // 由于现在求的未旋转前的坐标是以没按比例缩减宽高前的坐标来计算的
    // 所以缩减宽高后，需要按照原来的中心点旋转回去，获得缩减宽高并旋转后对应的坐标
    // 然后以这个坐标和对称点获得新的中心点，并重新计算未旋转前的坐标
    const rotatedTopLeftPoint = calculateRotatedPointCoordinate(
      newTopLeftPoint,
      newCenterPoint,
      rotate,
    );
    newCenterPoint = getCenterPoint(rotatedTopLeftPoint, symmetricPoint);
    newTopLeftPoint = calculateRotatedPointCoordinate(
      rotatedTopLeftPoint,
      newCenterPoint,
      negateRotate,
    );
    newBottomRightPoint = calculateRotatedPointCoordinate(
      symmetricPoint,
      newCenterPoint,
      negateRotate,
    );

    newWidth = newBottomRightPoint.x - newTopLeftPoint.x;
    newHeight = newBottomRightPoint.y - newTopLeftPoint.y;
  }

  if (newWidth > 0 && newHeight > 0) {
    style.width = Math.round(newWidth);
    style.height = Math.round(newHeight);
    style.left = Math.round(newTopLeftPoint.x);
    style.top = Math.round(newTopLeftPoint.y);
    return style;
  }
  return prevDistance;
}

function calculateRightTop({
  rotate,
  currentPosition,
  symmetricPoint,
  proportion,
  prevDistance,
}: CalculateParams) {
  const style = getBaseStyle();
  const negateRotate = -rotate;

  let newCenterPoint = getCenterPoint(currentPosition, symmetricPoint);
  let newTopRightPoint = calculateRotatedPointCoordinate(
    currentPosition,
    newCenterPoint,
    negateRotate,
  );
  let newBottomLeftPoint = calculateRotatedPointCoordinate(
    symmetricPoint,
    newCenterPoint,
    negateRotate,
  );

  let newWidth = newTopRightPoint.x - newBottomLeftPoint.x;
  let newHeight = newBottomLeftPoint.y - newTopRightPoint.y;

  if (typeof proportion === 'number') {
    if (newWidth / newHeight > proportion) {
      newTopRightPoint.x -= Math.abs(newWidth - newHeight * proportion);
      newWidth = newHeight * proportion;
    } else {
      newTopRightPoint.y += Math.abs(newHeight - newWidth / proportion);
      newHeight = newWidth / proportion;
    }

    const rotatedTopRightPoint = calculateRotatedPointCoordinate(
      newTopRightPoint,
      newCenterPoint,
      rotate,
    );
    newCenterPoint = getCenterPoint(rotatedTopRightPoint, symmetricPoint);
    newTopRightPoint = calculateRotatedPointCoordinate(
      rotatedTopRightPoint,
      newCenterPoint,
      negateRotate,
    );
    newBottomLeftPoint = calculateRotatedPointCoordinate(
      symmetricPoint,
      newCenterPoint,
      negateRotate,
    );

    newWidth = newTopRightPoint.x - newBottomLeftPoint.x;
    newHeight = newBottomLeftPoint.y - newTopRightPoint.y;
  }

  if (newWidth > 0 && newHeight > 0) {
    style.width = Math.round(newWidth);
    style.height = Math.round(newHeight);
    style.left = Math.round(newBottomLeftPoint.x);
    style.top = Math.round(newTopRightPoint.y);
    return style;
  }
  return prevDistance;
}

function calculateRightBottom({
  rotate,
  currentPosition,
  symmetricPoint,
  proportion,
  prevDistance,
}: CalculateParams) {
  const style = getBaseStyle();
  const negateRotate = -rotate;

  let newCenterPoint = getCenterPoint(currentPosition, symmetricPoint);
  let newTopLeftPoint = calculateRotatedPointCoordinate(
    symmetricPoint,
    newCenterPoint,
    negateRotate,
  );
  let newBottomRightPoint = calculateRotatedPointCoordinate(
    currentPosition,
    newCenterPoint,
    negateRotate,
  );

  let newWidth = newBottomRightPoint.x - newTopLeftPoint.x;
  let newHeight = newBottomRightPoint.y - newTopLeftPoint.y;

  if (typeof proportion === 'number') {
    if (newWidth / newHeight > proportion) {
      newBottomRightPoint.x -= Math.abs(newWidth - newHeight * proportion);
      newWidth = newHeight * proportion;
    } else {
      newBottomRightPoint.y -= Math.abs(newHeight - newWidth / proportion);
      newHeight = newWidth / proportion;
    }

    const rotatedBottomRightPoint = calculateRotatedPointCoordinate(
      newBottomRightPoint,
      newCenterPoint,
      rotate,
    );
    newCenterPoint = getCenterPoint(rotatedBottomRightPoint, symmetricPoint);
    newTopLeftPoint = calculateRotatedPointCoordinate(
      symmetricPoint,
      newCenterPoint,
      negateRotate,
    );
    newBottomRightPoint = calculateRotatedPointCoordinate(
      rotatedBottomRightPoint,
      newCenterPoint,
      negateRotate,
    );

    newWidth = newBottomRightPoint.x - newTopLeftPoint.x;
    newHeight = newBottomRightPoint.y - newTopLeftPoint.y;
  }

  if (newWidth > 0 && newHeight > 0) {
    style.width = Math.round(newWidth);
    style.height = Math.round(newHeight);
    style.left = Math.round(newTopLeftPoint.x);
    style.top = Math.round(newTopLeftPoint.y);
    return style;
  }
  return prevDistance;
}

function calculateLeftBottom({
  rotate,
  currentPosition,
  symmetricPoint,
  proportion,
  prevDistance,
}: CalculateParams) {
  const style = getBaseStyle();
  const negateRotate = -rotate;

  let newCenterPoint = getCenterPoint(currentPosition, symmetricPoint);
  let newTopRightPoint = calculateRotatedPointCoordinate(
    symmetricPoint,
    newCenterPoint,
    negateRotate,
  );
  let newBottomLeftPoint = calculateRotatedPointCoordinate(
    currentPosition,
    newCenterPoint,
    negateRotate,
  );

  let newWidth = newTopRightPoint.x - newBottomLeftPoint.x;
  let newHeight = newBottomLeftPoint.y - newTopRightPoint.y;

  if (typeof proportion === 'number') {
    if (newWidth / newHeight > proportion) {
      newBottomLeftPoint.x += Math.abs(newWidth - newHeight * proportion);
      newWidth = newHeight * proportion;
    } else {
      newBottomLeftPoint.y -= Math.abs(newHeight - newWidth / proportion);
      newHeight = newWidth / proportion;
    }

    const rotatedBottomLeftPoint = calculateRotatedPointCoordinate(
      newBottomLeftPoint,
      newCenterPoint,
      rotate,
    );
    newCenterPoint = getCenterPoint(rotatedBottomLeftPoint, symmetricPoint);
    newTopRightPoint = calculateRotatedPointCoordinate(
      symmetricPoint,
      newCenterPoint,
      negateRotate,
    );
    newBottomLeftPoint = calculateRotatedPointCoordinate(
      rotatedBottomLeftPoint,
      newCenterPoint,
      negateRotate,
    );

    newWidth = newTopRightPoint.x - newBottomLeftPoint.x;
    newHeight = newBottomLeftPoint.y - newTopRightPoint.y;
  }

  if (newWidth > 0 && newHeight > 0) {
    style.width = Math.round(newWidth);
    style.height = Math.round(newHeight);
    style.left = Math.round(newBottomLeftPoint.x);
    style.top = Math.round(newTopRightPoint.y);
    return style;
  }
  return prevDistance;
}

function calculateTop({
  rotate,
  size,
  currentPosition,
  symmetricPoint,
  movePointOrigin,
  proportion,
  prevDistance,
}: CalculateParams) {
  const style = getBaseStyle();
  const negateRotate = -rotate;

  const rotatedPosition = calculateRotatedPointCoordinate(
    currentPosition,
    movePointOrigin,
    negateRotate,
  );
  const rotatedTopMiddlePoint = calculateRotatedPointCoordinate(
    {
      x: movePointOrigin.x,
      y: rotatedPosition.y,
    },
    movePointOrigin,
    rotate,
  );

  // 勾股定理
  const newHeight = Math.sqrt(
    (rotatedTopMiddlePoint.x - symmetricPoint.x) ** 2 +
      (rotatedTopMiddlePoint.y - symmetricPoint.y) ** 2,
  );

  if (newHeight > 0) {
    const newCenter = {
      x:
        rotatedTopMiddlePoint.x -
        (rotatedTopMiddlePoint.x - symmetricPoint.x) / 2,
      y:
        rotatedTopMiddlePoint.y +
        (symmetricPoint.y - rotatedTopMiddlePoint.y) / 2,
    };

    let { width } = size;
    // 因为调整的是高度 所以只需根据锁定的比例调整宽度即可
    if (typeof proportion === 'number') {
      width = newHeight * proportion;
    }

    style.width = width;
    style.height = Math.round(newHeight);
    style.top = Math.round(newCenter.y - newHeight / 2);
    style.left = Math.round(newCenter.x - style.width / 2);
    return style;
  }
  return prevDistance;
}

function calculateRight({
  rotate,
  size,
  currentPosition,
  symmetricPoint,
  movePointOrigin,
  proportion,
  prevDistance,
}: CalculateParams) {
  const style = getBaseStyle();
  const negateRotate = -rotate;

  const rotatedPosition = calculateRotatedPointCoordinate(
    currentPosition,
    movePointOrigin,
    negateRotate,
  );
  const rotatedRightMiddlePoint = calculateRotatedPointCoordinate(
    {
      x: rotatedPosition.x,
      y: movePointOrigin.y,
    },
    movePointOrigin,
    rotate,
  );

  const newWidth = Math.sqrt(
    (rotatedRightMiddlePoint.x - symmetricPoint.x) ** 2 +
      (rotatedRightMiddlePoint.y - symmetricPoint.y) ** 2,
  );
  if (newWidth > 0) {
    const newCenter = {
      x:
        rotatedRightMiddlePoint.x -
        (rotatedRightMiddlePoint.x - symmetricPoint.x) / 2,
      y:
        rotatedRightMiddlePoint.y +
        (symmetricPoint.y - rotatedRightMiddlePoint.y) / 2,
    };

    let { height } = size;
    // 因为调整的是宽度 所以只需根据锁定的比例调整高度即可
    if (typeof proportion === 'number') {
      height = newWidth / proportion;
    }

    style.height = height;
    style.width = Math.round(newWidth);
    style.top = Math.round(newCenter.y - style.height / 2);
    style.left = Math.round(newCenter.x - newWidth / 2);
    return style;
  }
  return prevDistance;
}

function calculateBottom({
  rotate,
  size,
  currentPosition,
  symmetricPoint,
  movePointOrigin,
  proportion,
  prevDistance,
}: CalculateParams) {
  const style = getBaseStyle();
  const negateRotate = -rotate;

  const rotatedPosition = calculateRotatedPointCoordinate(
    currentPosition,
    movePointOrigin,
    negateRotate,
  );
  const rotatedBottomMiddlePoint = calculateRotatedPointCoordinate(
    {
      x: movePointOrigin.x,
      y: rotatedPosition.y,
    },
    movePointOrigin,
    rotate,
  );

  const newHeight = Math.sqrt(
    (rotatedBottomMiddlePoint.x - symmetricPoint.x) ** 2 +
      (rotatedBottomMiddlePoint.y - symmetricPoint.y) ** 2,
  );
  if (newHeight > 0) {
    const newCenter = {
      x:
        rotatedBottomMiddlePoint.x -
        (rotatedBottomMiddlePoint.x - symmetricPoint.x) / 2,
      y:
        rotatedBottomMiddlePoint.y +
        (symmetricPoint.y - rotatedBottomMiddlePoint.y) / 2,
    };

    let { width } = size;
    // 因为调整的是高度 所以只需根据锁定的比例调整宽度即可
    if (typeof proportion === 'number') {
      width = newHeight * proportion;
    }

    style.width = width;
    style.height = Math.round(newHeight);
    style.top = Math.round(newCenter.y - newHeight / 2);
    style.left = Math.round(newCenter.x - style.width / 2);
    return style;
  }
  return prevDistance;
}

function calculateLeft({
  rotate,
  size,
  currentPosition,
  symmetricPoint,
  movePointOrigin,
  proportion,
  prevDistance,
}: CalculateParams) {
  const style = getBaseStyle();
  const negateRotate = -rotate;

  const rotatedPosition = calculateRotatedPointCoordinate(
    currentPosition,
    movePointOrigin,
    negateRotate,
  );
  const rotatedLeftMiddlePoint = calculateRotatedPointCoordinate(
    {
      x: rotatedPosition.x,
      y: movePointOrigin.y,
    },
    movePointOrigin,
    rotate,
  );

  const newWidth = Math.sqrt(
    (rotatedLeftMiddlePoint.x - symmetricPoint.x) ** 2 +
      (rotatedLeftMiddlePoint.y - symmetricPoint.y) ** 2,
  );
  if (newWidth > 0) {
    const newCenter = {
      x:
        rotatedLeftMiddlePoint.x -
        (rotatedLeftMiddlePoint.x - symmetricPoint.x) / 2,
      y:
        rotatedLeftMiddlePoint.y +
        (symmetricPoint.y - rotatedLeftMiddlePoint.y) / 2,
    };

    let { height } = size;
    if (typeof proportion === 'number') {
      height = newWidth / proportion;
    }

    style.height = height;
    style.width = Math.round(newWidth);
    style.top = Math.round(newCenter.y - style.height / 2);
    style.left = Math.round(newCenter.x - newWidth / 2);
    return style;
  }
  return prevDistance;
}

export const mouseHandler: Record<ResizePoint, Handler> = {
  right_bottom: calculateRightBottom,
  left_bottom: calculateLeftBottom,
  right_top: calculateRightTop,
  left_top: calculateLeftTop,
  left: calculateLeft,
  top: calculateTop,
  right: calculateRight,
  bottom: calculateBottom,
};
