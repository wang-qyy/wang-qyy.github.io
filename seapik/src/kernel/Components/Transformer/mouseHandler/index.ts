import { ResizePoint } from '@kernel/Components/TransformPoints/handler';
import { Coordinate, Position, RectLimit } from '@kernel/typing';

import {
  get2PointDistance,
  getRectCenterPoint,
  getRectCoordinateByAssetStyle,
  RectCoordinate,
  RectCoordinateObject,
  rectPointArray2Object,
  rectPointToStyle,
  rotatePoint,
  rotateRect,
  transformationRect,
} from '@kernel/utils/mouseHandler/reactHelper';
import {
  TransformerProps,
  Size,
  TransformerHandlerParams,
  RotateHandlerParams,
} from '@kernel/Components/Transformer/typing';

/**
 * @description 由于等比缩放是以对角线的角为圆心，所以除了右下角，其他的位置都需要补偿位置，以保证对角线位置不变
 * @param size 源尺寸
 * @param newSize 新尺寸
 */
export function positionCompensate(size: Size, newSize: Size) {
  return {
    x: newSize.width - size.width,
    y: newSize.height - size.height,
  };
}

// 解决chrome bug： 鼠标 down与up不在同一个元素上触发，导致鼠标触发down后必定派生出drag事件
export function stopDragEvent(e: MouseEvent) {
  e.preventDefault();
}

/**
 * @description 处理旋转
 */
export class RotateHandler {
  onChange: RotateHandlerParams['onChange'];

  onChangeEnd?: RotateHandlerParams['onChangeEnd'];

  rotate: number;

  protected centerPoint: Coordinate;

  constructor({
    rotate,
    centerPoint,
    onChange,
    onChangeEnd,
  }: RotateHandlerParams) {
    this.rotate = rotate;
    this.centerPoint = centerPoint;
    this.onChange = onChange;
    this.onChangeEnd = onChangeEnd;
  }

  mouseUp = () => {
    window.removeEventListener('mousemove', this.mouseMove);
    window.removeEventListener('mouseup', this.mouseUp);
    this.onChangeEnd?.({
      rotate: this.rotate,
    });
  };

  mouseDown = () => {
    window.addEventListener('mousemove', this.mouseMove);
    window.addEventListener('mouseup', this.mouseUp);
  };

  mouseMove = (mouseEvent: MouseEvent) => {
    const x1 = this.centerPoint.x;
    const y1 = this.centerPoint.y;
    const x2 = mouseEvent.clientX;
    const y2 = mouseEvent.clientY;

    const x = Math.abs(x1 - x2);
    const y = Math.abs(y1 - y2);
    const z = Math.sqrt(x ** 2 + y ** 2);
    const cos = y / z;
    let angle = Math.round(180 / (Math.PI / Math.acos(cos)));

    if (x2 > x1 && y2 > y1) {
      // 鼠标在第四象限
      angle = 180 - angle;
    }

    if (x2 == x1 && y2 > y1) {
      // 鼠标在y轴负方向上
      angle = 180;
    }

    if (x2 > x1 && y2 == y1) {
      // 鼠标在x轴正方向上
      angle = 90;
    }

    if (x2 < x1 && y2 > y1) {
      // 鼠标在第三象限
      angle = 180 + angle;
    }

    if (x2 < x1 && y2 == y1) {
      // 鼠标在x轴负方向
      angle = 270;
    }

    if (x2 < x1 && y2 < y1) {
      // 鼠标在第二象限
      angle = 360 - angle;
    }
    this.rotate = (angle + 180) % 360;
    this.onChange({
      rotate: this.rotate,
    });
  };
}

class RectHelper {
  rectPoint!: RectCoordinateObject;

  centerPoint!: Coordinate;

  scaleInfo!: {
    scalePoint: Coordinate;
    startPoint: Coordinate;
    originDistance: number;
    targetKey?: 'x' | 'y';
  };

  rectLimit: {
    minRect?: RectLimit;
    maxRect?: RectLimit;
  };

  type: ResizePoint;

  rotate: number;

  l2r = 0;

  t2b = 0;

  // 左上角到右下角的距离
  lt2rb = 0;

  // 左下角到右上角的距离
  lb2rt = 0;

  constructor(
    rectPoint: RectCoordinate,
    centerPoint: Coordinate,
    type: ResizePoint,
    rotate: number,
    rectLimit: {
      minRect?: RectLimit;
      maxRect?: RectLimit;
    },
  ) {
    this.type = type;
    this.rotate = rotate;
    this.rectLimit = rectLimit;
    this.updateCenterPoint(centerPoint);
    this.updateRectPoint(rectPoint);
    this.updateScaleInfo();
  }

  checkLimit = (coordinate: Coordinate) => {
    const { maxRect, minRect } = this.rectLimit;
    let { x, y } = coordinate;

    if (this.type.includes('right')) {
      if (maxRect) {
        x = Math.min(x, maxRect.xMax);
      }
      if (minRect) {
        x = Math.max(x, minRect.xMax);
      }
    } else if (this.type.includes('left')) {
      if (maxRect) {
        x = Math.max(x, maxRect.xMin);
      }
      if (minRect) {
        x = Math.min(x, minRect.xMin);
      }
    }
    if (this.type.includes('top')) {
      if (maxRect) {
        y = Math.max(y, maxRect.yMin);
      }
      if (minRect) {
        y = Math.min(y, minRect.yMin);
      }
    } else if (this.type.includes('bottom')) {
      if (maxRect) {
        y = Math.min(y, maxRect.yMax);
      }
      if (minRect) {
        y = Math.max(y, minRect.yMax);
      }
    }
    return {
      x,
      y,
    };
  };

  updateScaleInfo = () => {
    const { scalePoint, originDistance, targetKey, startPoint } =
      // @ts-ignore
      this[this.type]();

    this.scaleInfo = {
      scalePoint,
      originDistance,
      targetKey,
      startPoint,
    };
    if (this.rotate > 0 && startPoint) {
      this.scaleInfo.startPoint = rotatePoint(
        startPoint,
        this.centerPoint,
        this.rotate,
      );
    }
  };

  updateCenterPoint = (centerPoint: Coordinate) => {
    this.centerPoint = centerPoint;
  };

  updateRectPoint = (rectPoint: RectCoordinate) => {
    this.rectPoint = rectPointArray2Object(rectPoint);
    const { lt, rt, rb, lb } = this.rectPoint;
    this.l2r = get2PointDistance(lt, rt);
    this.t2b = get2PointDistance(lt, lb);
    this.lt2rb = get2PointDistance(lt, rb);
    this.lb2rt = get2PointDistance(lb, rt);
  };

  calcPoint = (
    scalePoint: Coordinate,
    startPoint: Coordinate,
    originDistance: number,
    mousePoint: Coordinate,
  ) => {
    const newDistance = get2PointDistance(startPoint, mousePoint);
    const scale = newDistance / originDistance;
    return {
      scalePoint,
      scaleNumber: {
        x: scale,
        y: scale,
      },
    };
  };

  calcBorder = (
    scalePoint: Coordinate,
    startPoint: Coordinate,
    originDistance: number,
    mousePoint: Coordinate,
    targetKey: 'x' | 'y',
  ) => {
    const newDistance = get2PointDistance(startPoint, mousePoint);
    const scaleNumber = {
      x: 1,
      y: 1,
    };
    scaleNumber[targetKey] = newDistance / originDistance;
    return {
      scalePoint,
      scaleNumber,
    };
  };

  left = () => {
    const startPoint = { x: this.rectPoint.rt.x, y: this.centerPoint.y };
    const scalePoint = this.rectPoint.rt;
    return {
      scalePoint,
      startPoint,
      originDistance: this.l2r,
      targetKey: 'x',
    };
  };

  right = () => {
    const startPoint = { x: this.rectPoint.lt.x, y: this.centerPoint.y };
    const scalePoint = this.rectPoint.lt;
    return {
      scalePoint,
      startPoint,
      originDistance: this.l2r,
      targetKey: 'x',
    };
  };

  top = () => {
    const startPoint = { x: this.centerPoint.x, y: this.rectPoint.lb.y };
    const scalePoint = this.rectPoint.rb;
    return {
      scalePoint,
      startPoint,
      originDistance: this.t2b,
      targetKey: 'y',
    };
  };

  bottom = () => {
    const startPoint = { x: this.centerPoint.x, y: this.rectPoint.lt.y };
    const scalePoint = this.rectPoint.lt;
    return {
      startPoint,
      scalePoint,
      originDistance: this.t2b,
      targetKey: 'y',
    };
  };

  left_top = () => {
    return {
      startPoint: this.rectPoint.rb,
      scalePoint: this.rectPoint.rb,
      originDistance: this.lt2rb,
    };
  };

  left_bottom = () => {
    return {
      startPoint: this.rectPoint.rt,
      scalePoint: this.rectPoint.rt,
      originDistance: this.lb2rt,
    };
  };

  right_top = () => {
    return {
      startPoint: this.rectPoint.lb,
      scalePoint: this.rectPoint.lb,
      originDistance: this.lb2rt,
    };
  };

  right_bottom = () => {
    return {
      startPoint: this.rectPoint.lt,
      scalePoint: this.rectPoint.lt,
      originDistance: this.lt2rb,
    };
  };

  getScaleInfo = (mousePoint: Coordinate) => {
    const { scalePoint, originDistance, targetKey, startPoint } =
      this.scaleInfo;
    const point = mousePoint;
    // const point = this.checkLimit(mousePoint);
    if (targetKey) {
      return this.calcBorder(
        scalePoint,
        startPoint,
        originDistance,
        point,
        targetKey,
      );
    }
    return this.calcPoint(scalePoint, startPoint, originDistance, point);
  };
}

export class TransformerHandler {
  rotate: number;

  style: TransformerProps['style'];

  styleResult: TransformerProps['style'];

  onChange: TransformerHandlerParams['onChange'];

  onChangeEnd?: TransformerHandlerParams['onChangeEnd'];

  canvasRect: DOMRect;

  type: ResizePoint;

  aspectRatio: boolean;

  rectLimit: {
    minRect?: RectLimit;
    maxRect?: RectLimit;
  };

  rectPoint: RectCoordinate;

  centerPoint: Coordinate;

  rotateCenter: Coordinate;

  rectHelper: RectHelper;

  constructor({
    rotate,
    style,
    onChange,
    onChangeEnd,
    type,
    rectLimit,
    getRect,
    rotateCenter,
    aspectRatio,
  }: TransformerHandlerParams) {
    this.rotate = rotate;
    this.aspectRatio = aspectRatio;
    this.style = { ...style };
    this.onChange = onChange;
    this.onChangeEnd = onChangeEnd;
    this.type = type;
    this.rectLimit = rectLimit;
    this.canvasRect = getRect() as DOMRect;
    const { rect, center } = getRectCoordinateByAssetStyle(style);
    this.rectPoint = rect;
    this.centerPoint = center;
    this.rotateCenter = rotateCenter || center;
    this.rectHelper = new RectHelper(
      rect,
      this.centerPoint,
      this.type,
      this.rotate,
      rectLimit,
    );
    this.styleResult = { ...style };
  }

  /**
   * @description 根据鼠标的点击位置，获取基于canvas的坐标
   *  @param   {Object}  mouseEvent 旋转中心
   */
  getMousePositionInCanvas(mouseEvent: MouseEvent) {
    const { left, top } = this.canvasRect;
    const { clientX, clientY } = mouseEvent;
    return {
      x: clientX - left,
      y: clientY - top,
    };
  }

  mouseUp = () => {
    window.removeEventListener('mousemove', this.mouseMove);
    window.removeEventListener('mouseup', this.mouseUp);
    this.onChangeEnd?.(this.styleResult);
  };

  mouseDown = () => {
    window.addEventListener('mousemove', this.mouseMove);
    window.addEventListener('mouseup', this.mouseUp);
  };

  mouseMove = (mouseEvent: MouseEvent) => {
    const position = this.getMousePositionInCanvas(mouseEvent);
    const { scalePoint, scaleNumber } = this.rectHelper.getScaleInfo(position);
    let newRect = transformationRect(
      this.rectPoint,
      this.rotateCenter,
      scalePoint,
      scaleNumber,
      this.rotate,
    );
    if (this.rotate > 0) {
      const newCenter = getRectCenterPoint(newRect);
      newRect = rotateRect(newRect, newCenter, -this.rotate);
    }
    this.styleResult = rectPointToStyle(newRect);
    this.onChange(this.styleResult);
  };
}
