import { CSSProperties, MouseEvent } from 'react';
import {
  dataType,
  addEventListener,
  getCanvasClientRect,
} from '@kernel/utils/single';
import {
  mouseHandler,
  calculateRotatedPointCoordinate,
  getCenterPointFromSize,
} from '@kernel/utils/mouseHandler/mouseHandlerHelper';
import { ResizePoint } from '@kernel/Components/TransformPoints/handler';
import {
  Auxiliary,
  Coordinate,
  Position,
  AssetSizeAndPosition,
  PanelBorder,
} from '@kernel/typing';
import {
  calculateAssetPoint,
  auxiliaryPointsMatching,
} from '@kernel/utils/auxiliaryLineHandler';
import {
  AuxiliaryLineStyle,
  AuxiliaryLineBase,
} from '@kernel/Canvas/AuxiliaryLine/hooks';

export interface Compensate {
  axlePoint: Coordinate;
  symmetryPoint: Coordinate;
}

export interface Size {
  width: number;
  height: number;
  compensate?: Compensate;
}

export interface MoveHandlerCallbackParams {
  styles: AuxiliaryLineStyle;
  position: Position;
  increment: Position;
  targetIndex?: number[];
}

type SizeCalculator = (compensate: Compensate) => Size;

interface Rotate {
  rotate: number;
}
export interface OriginCoordinate {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  top: number;
  fontSize?: number;
  container: AssetSizeAndPosition;
  asset: AssetSizeAndPosition;
  rectInfo: RectInfo;
}

export interface BaseSize {
  width: number;
  height: number;
  left: number;
  top: number;
  rotate?: number;
}

interface RectInfo {
  rotate?: number;
  // 轴心坐标，也就是拖拽时的对称坐标
  axleX: number;
  axleY: number;
  // 原始的对称点坐标
  symmetryY: number;
  symmetryX: number;
  originCenterPoint: Coordinate;
  container: AssetSizeAndPosition;
  asset: AssetSizeAndPosition;
}

export interface ElementStyle {
  top: CSSProperties['top'];
  left: CSSProperties['left'];
  width: CSSProperties['width'];
  height: CSSProperties['height'];
  rotate?: number;
}

export type ElementStyleNumeral = Record<keyof ElementStyle, number>;

type ListenerItem = () => void;
interface Listeners {
  mouseMove?: ListenerItem;
  dragStart?: ListenerItem;
  mouseUp?: ListenerItem;
}
interface Options {
  panelBorder?: PanelBorder;
}
type GetElementStyle = () => ElementStyle;

interface Hooks<T> {
  beforeMove?: (e: MouseEvent) => void;
  onMoving: (e: MouseEvent, position: T) => void;
  stopMove?: (e: MouseEvent) => void;
}

const positionLimit = (value: number, min: number, max: number) => {
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }
  return value;
};

/**
 * @description 格式化数据为等比例宽高
 * @param sizeProportion 宽高比 width/height
 * @param size 元素宽高
 */
export function formatSizeWithProportion(sizeProportion: number, size: Size) {
  const { width } = size;
  const { height } = size;

  const distanceProportion = width / height;
  if (sizeProportion === distanceProportion) {
    return {
      width,
      height,
    };
  }
  return {
    width,
    height: width / sizeProportion,
  };
}

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
 * @description 处理鼠标移动距离
 */
class MouseMovingDistance {
  private originalPosition: { startY: number; startX: number };

  constructor(mouseEvent: MouseEvent) {
    const { clientY, clientX } = mouseEvent;
    this.originalPosition = {
      startY: clientY,
      startX: clientX,
    };
  }

  mouseMove = (mouseEvent: MouseEvent) => {
    const { clientX, clientY } = mouseEvent;
    const { startX, startY } = this.originalPosition;

    return {
      x: clientX - startX,
      y: clientY - startY,
    };
  };
}

/**
 * @description 鼠标事件基类
 */
abstract class MouseHandler<H> {
  protected listeners: Listeners;

  protected options: Options;

  protected hooks: Hooks<H>;

  constructor(hooks: Hooks<H>, options?: Options) {
    this.listeners = {};

    this.hooks = hooks;

    this.options = options || {};
  }

  /**
   * @description 将样式数据转化为number
   * @param elementStyle
   */
  styleNumeral = (elementStyle: ElementStyle) => {
    const styles: (keyof ElementStyle)[] = [
      'top',
      'left',
      'width',
      'height',
      'rotate',
    ];
    const styleNumeral: Partial<ElementStyleNumeral> = {};
    styles.forEach((key: keyof ElementStyle) => {
      let item = elementStyle[key] as string | number;
      if (typeof item === 'string') {
        item = parseInt(item, 10);
      }
      styleNumeral[key] = item;
    });
    return styleNumeral;
  };

  protected mouseUp = (e: MouseEvent) => {
    this.hooks?.stopMove?.(e);
    this.listeners?.mouseUp?.();
    this.listeners?.mouseMove?.();
    this.listeners?.dragStart?.();
  };

  protected abstract mouseMove(mouseEvent: MouseEvent): any;

  mouseDown = () => {
    this.listeners = {
      mouseUp: addEventListener(
        window,
        'mouseup',
        this.mouseUp,
      ) as ListenerItem,
      mouseMove: addEventListener(
        window,
        'mousemove',
        this.mouseMove,
      ) as ListenerItem,
      dragStart: addEventListener(
        window,
        'dragstart',
        stopDragEvent,
      ) as ListenerItem,
    };
  };
}

/**
 * @description 处理移动
 */
export class MoveHandler extends MouseHandler<MoveHandlerCallbackParams> {
  private MMD: MouseMovingDistance | undefined;

  protected moveDistance: Position;

  protected originPosition: BaseSize;

  protected getElementStyle: GetElementStyle;

  protected auxiliaryPoints: Record<number, Auxiliary>;

  constructor(
    getElementStyle: GetElementStyle,
    auxiliaryPoints: Record<number, Auxiliary>,
    hooks: Hooks<MoveHandlerCallbackParams>,
    options?: Options,
  ) {
    super(hooks, options);
    if (dataType(getElementStyle) !== 'Function') {
      throw new Error(
        `getElementStyle need Function,but got ${dataType(getElementStyle)}`,
      );
    }
    this.auxiliaryPoints = auxiliaryPoints;
    const elementStyle = getElementStyle();
    const {
      top = 0,
      left = 0,
      width = 0,
      height = 0,
      rotate = 0,
    } = this.styleNumeral(elementStyle);
    this.originPosition = {
      left,
      top,
      width,
      rotate,
      height,
    };
    this.getElementStyle = getElementStyle;
    this.moveDistance = {
      top: 0,
      left: 0,
    };
  }

  protected handleAuxiliary = (current: Auxiliary, origin: Position) => {
    const { auxiliaryPoints } = this;
    const styles: AuxiliaryLineStyle = {
      vertical: undefined,
      horizontal: undefined,
    };
    // 辅助线数据
    const auxiliaryInfo: AuxiliaryLineBase<{
      index: number;
      position: Position;
    }> = {
      vertical: undefined,
      horizontal: undefined,
    };

    // 遍历辅助线数据，检测是否存在距离相近的元素
    for (const index in auxiliaryPoints) {
      const itemPoint = auxiliaryPoints[index];

      for (const direction in itemPoint) {
        const key = direction as keyof typeof itemPoint;
        // 是否存在尺寸相近的元素
        const result = auxiliaryPointsMatching(key, itemPoint, current);

        if (result) {
          // 设置命中线条的样式
          styles[key] = {
            [result.currentKey]: result.style,
          };

          // 设置辅助线信息，为命中元素添加边框
          // 当辅助线为画布时，不需要选中状态
          auxiliaryInfo[key] = {
            position: result.position,
            index: index === 'canvas' ? -1 : Number(index),
          };
        }
      }
    }

    const newPosition = {
      ...origin,
    };
    const targetIndex: number[] = [];
    // 命中数据中存在横轴数据
    if (auxiliaryInfo.horizontal) {
      const { position, index } = auxiliaryInfo.horizontal;
      newPosition.left = position.left;
      targetIndex.push(index);
    }
    // 命中数据中存在纵轴数据
    if (auxiliaryInfo.vertical) {
      const { position, index } = auxiliaryInfo.vertical;
      newPosition.top = position.top;
      targetIndex.push(index);
    }
    return {
      styles,
      targetIndex,
      position: newPosition,
    };
  };

  protected mouseMove = (mouseEvent: MouseEvent) => {
    if (!this.MMD) {
      this.MMD = new MouseMovingDistance(mouseEvent);
    }
    const { x, y } = this.MMD.mouseMove(mouseEvent);
    const {
      top = 0,
      left = 0,
      width = 0,
      height = 0,
      rotate = 0,
    } = this.originPosition;

    const moveDistance = {
      top: y + top,
      left: x + left,
    };
    const increment = {
      left: moveDistance.left - this.originPosition.left,
      top: moveDistance.top - this.originPosition.top,
    };
    // todo 暂时不支持旋转的对齐
    if (rotate) {
      this.hooks.onMoving(mouseEvent, {
        styles: {},
        increment,
        position: moveDistance,
      });
      return;
    }

    const currentPosition = calculateAssetPoint(
      { width, height },
      { x: moveDistance.left, y: moveDistance.top },
      rotate,
    );

    const {
      styles,
      position = moveDistance,
      targetIndex,
    } = this.handleAuxiliary(currentPosition, moveDistance);

    this.hooks.onMoving(mouseEvent, {
      styles,
      increment,
      targetIndex,
      position,
    });
  };
}

/**
 * @description 处理旋转
 */
export class RotateHandler extends MouseHandler<Rotate> {
  protected centerPoint: {
    centerPointX: number;
    centerPointY: number;
  };

  constructor(
    centerPoint: {
      centerPointX: number;
      centerPointY: number;
    },
    hooks: Hooks<Rotate>,
    options?: Options,
  ) {
    super(hooks, options);
    this.centerPoint = centerPoint;
  }

  protected mouseMove = (mouseEvent: MouseEvent) => {
    const x1 = this.centerPoint.centerPointX;
    const y1 = this.centerPoint.centerPointY;
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
    const tempRemainder = angle % 90;
    if (tempRemainder >= 87 || tempRemainder <= 3) {
      angle = Math.round(angle / 90) * 90;
    }
    this.hooks.onMoving(mouseEvent, {
      rotate: (angle + 180) % 360,
    });
  };
}

/**
 * @description 处理等比缩放
 */
export class SizeScaleHandler extends MouseHandler<{
  moveDistance: BaseSize;
  originCoordinate: OriginCoordinate;
}> {
  protected moveDistance: BaseSize;

  protected getElementStyle: GetElementStyle;

  protected rectInfo: RectInfo;

  protected type: ResizePoint;

  protected canvasRect: DOMRect;

  protected sizeCalculator: SizeCalculator = ({
    axlePoint,
    symmetryPoint,
  }: Compensate) => ({
    width: symmetryPoint.x - axlePoint.x,
    height: symmetryPoint.y - axlePoint.y,
  });

  // 图片的比例
  protected sizeProportion?: number;

  // 是否锁定宽高比
  protected needLockProportion: boolean;

  // 旋转
  protected rotate?: number;

  protected emptySize = {
    width: 0,
    height: 0,
  };

  protected emptyPoint = {
    x: 0,
    y: 0,
  };

  // 元素中心坐标
  protected centerPoint?: Coordinate;

  protected originCenterPoint?: Coordinate;

  protected axlePointRotated?: Coordinate;

  protected originMousePoint?: Coordinate;

  // 原始坐标信息
  protected originCoordinate?: OriginCoordinate;

  constructor(
    getElementStyle: GetElementStyle,
    needLockProportion: boolean,
    type: ResizePoint,
    rectInfo: RectInfo,
    hooks: Hooks<{
      moveDistance: BaseSize;
      originCoordinate: OriginCoordinate;
    }>,
    options?: Options,
  ) {
    super(hooks, options);
    if (dataType(getElementStyle) !== 'Function') {
      throw new Error(
        `getElementStyle need Function,but got ${dataType(getElementStyle)}`,
      );
    }
    this.getElementStyle = getElementStyle;
    this.rectInfo = rectInfo;
    this.canvasRect = getCanvasClientRect() as DOMRect;
    this.needLockProportion = needLockProportion;
    this.type = type;

    this.moveDistance = {
      ...this.emptySize,
      left: 0,
      top: 0,
    };
  }

  init = (mouseEvent: MouseEvent) => {
    const mousePoint = this.getMousePositionInCanvas(mouseEvent);
    const { clientX, clientY } = mouseEvent;
    const {
      width = 0,
      height = 0,
      rotate = 0,
      left = 0,
      top = 0,
    } = this.getStyle();
    const {
      axleX = 0,
      axleY = 0,
      asset,
      originCenterPoint,
      symmetryX = 0,
      symmetryY = 0,
      container,
    } = this.rectInfo;

    this.rotate = rotate;
    this.sizeProportion = width / height;
    this.originCenterPoint = getCenterPointFromSize(
      { left, top },
      { width, height },
    );
    // 未旋转时的中心点
    this.centerPoint = {
      ...this.originCenterPoint,
    };
    this.axlePointRotated = calculateRotatedPointCoordinate(
      {
        x: axleX,
        y: axleY,
      },
      this.originCenterPoint,
      rotate,
    );
    this.originMousePoint = mousePoint;
    // this.mousePoint = mousePoint;
    this.originCoordinate = {
      x: clientX,
      y: clientY,
      left,
      top,
      fontSize: asset?.fontSize ?? 0,
      width,
      height,
      container,
      asset,
      rectInfo: { ...this.rectInfo },
    };
    this.mouseMove(mouseEvent);
  };

  getStyle = () => {
    const elementStyle = this.getElementStyle();
    return this.styleNumeral(elementStyle);
  };

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

  protected mouseMove = (mouseEvent: MouseEvent) => {
    if (
      !this.originCoordinate ||
      !this.originMousePoint ||
      !this.axlePointRotated ||
      this.rotate === undefined
    ) {
      this.init(mouseEvent);
      return;
    }

    const currentPosition = this.getMousePositionInCanvas(mouseEvent);
    const params = {
      rotate: this.rotate,
      currentPosition,
      symmetricPoint: this.axlePointRotated,
      proportion: this.needLockProportion ? this.sizeProportion : undefined,
      size: {
        width: this.originCoordinate.width,
        height: this.originCoordinate.height,
      },
      movePointOrigin: { ...this.originMousePoint },
      prevDistance: {
        ...this.moveDistance,
      },
    };
    this.moveDistance = mouseHandler[this.type](params);
    // console.log("originCoordinate", this.originCoordinate);
    // console.log('moveDistance', this.moveDistance);
    // console.log("currentPosition", currentPosition);
    this.hooks.onMoving(mouseEvent, {
      moveDistance: { ...this.moveDistance },
      originCoordinate: this.originCoordinate,
    });
  };
}
