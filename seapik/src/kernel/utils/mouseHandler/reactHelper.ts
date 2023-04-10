import {
  AssetBaseSize,
  AssetClass,
  Coordinate,
  RectLimit,
} from '@/kernel/typing';
import {
  applyToPoint,
  applyToPoints,
  rotate,
  compose,
  scale,
} from 'transformation-matrix';
import { TransformerProps } from '@kernel/Components/Transformer/typing';
// 矩形坐标
export type RectCoordinate = [
  Coordinate, // lt
  Coordinate, // rt
  Coordinate, // rb
  Coordinate, // lb
];

export interface RectCoordinateObject {
  lt: Coordinate; // lt
  rt: Coordinate; // rt
  rb: Coordinate; // rb
  lb: Coordinate; // lb
}

/**
 * @description 根据矩形中心点坐标与尺寸，反推出左上角坐标
 * @param size
 * @param center
 */
export function getRectLeftTopByCenterAndSize(
  size: AssetBaseSize,
  center: Coordinate,
): Coordinate {
  return {
    x: center.x - size.width / 2,
    y: center.y - size.height / 2,
  };
}

/**
 * @description 计算出样式
 * @param rectLimitCoordinate
 * @constructor
 */
export function rectLimitCoordinateToStyle(rectLimitCoordinate: RectLimit) {
  const { yMax, yMin, xMax, xMin } = rectLimitCoordinate;
  return { left: xMin, top: yMin, width: xMax - xMin, height: yMax - yMin };
}

/**
 * @description 获取矩形的四个极限位置
 * @param left
 * @param top
 * @param width
 * @param height
 */

export function getRectLimitCoordinate({
  left,
  top,
  width,
  height,
}: TransformerProps['style']) {
  return {
    xMin: left,
    xMax: left + width,
    yMin: top,
    yMax: top + height,
  };
}

/**
 * @description 获取矩形的四个点坐标
 * @param left
 * @param top
 * @param width
 * @param height
 */
export function getRectCoordinate({
  left,
  top,
  width,
  height,
}: TransformerProps['style']) {
  return [
    { x: left, y: top },
    { x: left + width, y: top },
    { x: left + width, y: top + height },
    { x: left, y: top + height },
  ];
}

/**
 * @description 获取矩形的中心点坐标
 * @param left
 * @param top
 * @param width
 * @param height
 */
export function getRectCenter({
  left,
  top,
  width,
  height,
}: TransformerProps['style']): Coordinate {
  return {
    x: left + width / 2,
    y: top + height / 2,
  };
}

/**
 * @description 获取矩形的中心点坐标
 * @param asset
 */
export function getAssetCenterScale(
  position: {
    left: number;
    top: number;
  },
  size: { width: number; height: number },
): Coordinate {
  return getRectCenter({
    ...position,
    ...size,
  });
}

/**
 * @description 根据元素样式属性获取矩形坐标区域
 * @param left
 * @param top
 * @param width
 * @param height
 */
export function getRectCoordinateByAssetStyle({
  left,
  top,
  width,
  height,
}: TransformerProps['style']): {
  rect: RectCoordinate;
  center: Coordinate;
} {
  return {
    rect: [
      { x: left, y: top },
      { x: left + width, y: top },
      { x: left + width, y: top + height },
      { x: left, y: top + height },
    ],
    center: getRectCenter({ left, top, width, height }),
  };
}

// 角度转弧度
// Math.PI = 180 度
export function angleToRadian(rotateNumber: number) {
  return (rotateNumber * Math.PI) / 180;
}

// 求两点之间的中点坐标
export function getCenterPoint(p1: Coordinate, p2: Coordinate) {
  return {
    x: Math.min(p1.x, p2.x) + Math.abs(p2.x - p1.x) / 2,
    y: Math.min(p1.y, p2.y) + Math.abs(p2.y - p1.y) / 2,
  };
}

// 求rect之间的中点坐标
export function getRectCenterPoint(rect: RectCoordinate) {
  const [lt, rt, rb, lb] = rect;
  return getCenterPoint(lt, rb);
}

/**
 * @description 获取两点距离
 * @param p1
 * @param p2
 */
export function get2PointDistance(p1: Coordinate, p2: Coordinate) {
  const a = p2.x - p1.x;
  const b = p2.y - p1.y;
  return Math.sqrt(a * a + b * b);
}

/**
 * @description 根据中心点和角度旋转矩阵
 * @param rect
 * @param center
 * @param rotateNumber
 */
export function rotateRect(
  rect: RectCoordinate,
  center: Coordinate,
  rotateNumber: number,
) {
  const matrix = rotate(angleToRadian(rotateNumber), center.x, center.y);
  return applyToPoints(matrix, rect) as RectCoordinate;
}

/**
 * @description 根据中心点和角度旋转点
 * @param rect
 * @param center
 * @param scalePoint
 * @param scaleNumber
 * @param rotateNumber
 */
export function transformationRect(
  rect: RectCoordinate,
  center: Coordinate,
  scalePoint: Coordinate,
  scaleNumber: Coordinate,
  rotateNumber: number,
) {
  const rotateMatrix = rotate(angleToRadian(rotateNumber), center.x, center.y);
  const scaleMatrix = scale(
    scaleNumber.x,
    scaleNumber.y,
    scalePoint.x,
    scalePoint.y,
  );
  const matrix = compose(rotateMatrix, scaleMatrix);
  return applyToPoints(matrix, rect) as RectCoordinate;
}

/**
 * @description 根据点位缩放rect
 * @param rect
 * @param center
 * @param scalePoint
 * @param scaleNumber
 */
export function scaleRect(
  rect: RectCoordinate,
  center: Coordinate,
  scalePoint: Coordinate,
  scaleNumber: Coordinate,
) {
  const scaleMatrix = scale(
    scaleNumber.x,
    scaleNumber.y,
    scalePoint.x,
    scalePoint.y,
  );
  return applyToPoints(scaleMatrix, rect) as RectCoordinate;
}

/**
 * @description 根据中心点和角度旋转点
 * @param point
 * @param center
 * @param rotateNumber
 */
export function rotatePoint(
  point: Coordinate,
  center: Coordinate,
  rotateNumber: number,
): Coordinate {
  const matrix = rotate(angleToRadian(rotateNumber), center.x, center.y);
  return applyToPoint(matrix, point) as Coordinate;
}

/**
 * @description 矩形点位转换为对象形式
 * @param rectPoint
 */
export function rectPointArray2Object(rectPoint: RectCoordinate) {
  const [lt, rt, rb, lb] = rectPoint;
  return {
    lt,
    rt,
    rb,
    lb,
  };
}

/**
 * @description 根据rect点位计算出实际样式
 * @param rect
 */
export function rectPointToStyle(rect: RectCoordinate) {
  const [lt, rt, rb, lb] = rect;
  return {
    left: lt.x,
    top: lt.y,
    width: Math.abs(rt.x - lt.x),
    height: Math.abs(rb.y - lt.y),
  };
}
