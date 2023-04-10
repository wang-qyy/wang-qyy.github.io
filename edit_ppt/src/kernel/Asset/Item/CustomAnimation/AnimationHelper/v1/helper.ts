import { fromString, inverse, compose, toCSS } from 'transformation-matrix';
import { BezierFactory } from '@kernel/Asset/Item/CustomAnimation/Bezier';
import { Assets, AeAKw, AeAItem } from '@kernel/typing';

import { deepCloneJson as cloneDeep } from '@kernel/utils/single';

export function cloneKw<T>(kw: T) {
  if (typeof kw === 'string') {
    return JSON.parse(kw);
  }
  return cloneDeep(kw);
}

export const defaultStyle = {
  opacity: 1,
  transformOriginX: 0,
  transformOriginY: 0,
  rotate: 0,
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
};
export type TDefaultStyle = typeof defaultStyle;
export const startKeys = ['opacity', 'rotate', 'scaleX', 'scaleY', 'scaleZ'];
export const kwDistanceKeys = ['translateX', 'translateY', 'translateZ'];
export const aeADistanceKeys = [
  'translateX',
  'translateY',
  'translateZ',
  'transformOriginX',
  'transformOriginY',
  'transformOriginZ',
];

/**
 * 获取 BezierEasing 计算函数
 * @param {object} keyFrame 关键帧对象
 * @param {0 | 1 | 2} index 取控制点的坐标的数组下标 x, y 为 [ number, number?, number? ]
 * @return { function } xPercentage => BezierEasingPercentage
 */
export const getFrameValueBezierEasing = (keyFrame: any, index: number) => {
  return keyFrame.i
    ? BezierFactory.getBezierEasing(
        keyFrame.o.x[index],
        keyFrame.o.y[index],
        keyFrame.i.x[index],
        keyFrame.i.y[index],
      ).get
    : (v) => v;
};

export const calcT = (
  minT: number,
  maxT: number,
  attribute: any,
  playbackRate: number,
) => {
  // 倍速不会影响 BezierEasing 的参数，同样的起始和结束，对应的帧不同，ae 导出的 i, o 结果相同
  if (attribute.k[0] && typeof attribute.k[0].t === 'number') {
    attribute.k.forEach((item) => {
      item.t = Math.round(item.t / playbackRate);
      item.t = Math.max(minT, Math.min(item.t, maxT)); // 保证 t 在区间 [ip, op]
    });
  }
};
/**
 * 计算出每一帧的具体样式
 * @param {defaultStyle[]} targetArray
 * @param { boolean } isAeA
 * @param {number} maxFrame kw.op
 * @param {{a: number, k: number[]}} attribute kw.ks.属性
 * @param {string[]} keys 需要更新的属性名 opacity | rotate | (translateX, translateY, translateZ) | (transformOriginX, transformOriginY, transformOriginZ) | (scaleX, scaleY, scaleZ)
 * @param {0 | 1} startRate 计算中间帧属性值时是否需要加上初始帧的值
 * @param {number} deltaRate 转换成 css 属性需要的倍率
 */
export const calcFrameStyle = (
  targetArray: any[],
  isAeA: boolean,
  maxFrame: number,
  attribute: any,
  keys: string[],
  startRate: number,
  deltaRate: number,
) => {
  const distanceKeys = isAeA ? aeADistanceKeys : kwDistanceKeys;
  let initDistance = [0, 0, 0];
  if (attribute.a === 0) {
    // k = [ number, number, number ]
    if (distanceKeys.includes(keys[0])) {
      initDistance = attribute.k;
    }
    for (let i = 0; i <= maxFrame; i++) {
      targetArray[i][keys[0]] = (attribute.k[0] - initDistance[0]) * deltaRate;
      keys[1] &&
        (targetArray[i][keys[1]] =
          (attribute.k[1] - initDistance[1]) * deltaRate);
      keys[2] &&
        (targetArray[i][keys[2]] =
          (attribute.k[2] - initDistance[2]) * deltaRate);
    }
  }
  if (attribute.a === 1 && attribute.k.length > 0) {
    const data = attribute.k;
    const dataLength = data.length;
    if (distanceKeys.includes(keys[0])) {
      initDistance = data[0].s;
    }
    if (dataLength === 1) {
      // 似乎触发不了这种情况，不存在 a === 1 && dataLength === 1
      for (let i = data[0].t; i <= maxFrame; i++) {
        targetArray[i][keys[0]] = (data[0].s[0] - initDistance[0]) * deltaRate;
        keys[1] &&
          (targetArray[i][keys[1]] =
            (data[0].s[1] - initDistance[1]) * deltaRate);
        keys[2] &&
          (targetArray[i][keys[2]] =
            (data[0].s[2] - initDistance[2]) * deltaRate);
      }
    } else {
      for (let i = 0; i < dataLength - 1; i++) {
        const start = data[i];
        const end = data[i + 1];
        const deltaT = end.t - start.t;
        const deltaS = [0, 0, 0];
        deltaS[0] = end.s[0] - start.s[0];
        keys[1] && (deltaS[1] = end.s[1] - start.s[1]);
        keys[2] && (deltaS[2] = end.s[2] - start.s[2]);
        const getFrameValue = [];
        getFrameValue[0] = getFrameValueBezierEasing(start, 0);
        keys[1] && (getFrameValue[1] = getFrameValueBezierEasing(start, 1));
        keys[2] && (getFrameValue[2] = getFrameValueBezierEasing(start, 2));
        targetArray.forEach((style, index) => {
          if (i === 0 && index < start.t && startKeys.includes(keys[0])) {
            style[keys[0]] = (start.s[0] - initDistance[0]) * deltaRate;
            keys[1] &&
              (style[keys[1]] = (start.s[1] - initDistance[1]) * deltaRate);
            keys[2] &&
              (style[keys[2]] = (start.s[2] - initDistance[2]) * deltaRate);
          }
          if (index >= start.t && index <= end.t) {
            const perc = (index - start.t) / deltaT;
            style[keys[0]] =
              (start.s[0] * startRate +
                getFrameValue[0](perc) * deltaS[0] -
                initDistance[0]) *
              deltaRate;
            keys[1] &&
              (style[keys[1]] =
                (start.s[1] * startRate +
                  getFrameValue[1](perc) * deltaS[1] -
                  initDistance[1]) *
                deltaRate);
            keys[2] &&
              (style[keys[2]] =
                (start.s[2] * startRate +
                  getFrameValue[2](perc) * deltaS[2] -
                  initDistance[2]) *
                deltaRate);
          } else if (i + 1 === dataLength - 1 && index > end.t) {
            style[keys[0]] = (end.s[0] - initDistance[0]) * deltaRate;
            keys[1] &&
              (style[keys[1]] = (end.s[1] - initDistance[1]) * deltaRate);
            keys[2] &&
              (style[keys[2]] = (end.s[2] - initDistance[2]) * deltaRate);
          }
        });
      }
    }
  }
};

/**
 * 计算 AE 导出的动画属性的静态类
 */
export class AnimationV1Helper {
  /** 动画每秒帧数 */
  static baseFrame = 30;

  static frameInterval: number = 1 / this.baseFrame;

  /** 通过使用 string[] 来控制 aeA 的遍历顺序, o 的矩阵计算 依赖 s 的结果 */
  static keyMap: ['i', 's', 'o'] = ['i', 's', 'o'];

  /**
   * 将原始 kw 深复制，并将帧数 t 根据倍速提前或者延后
   * @param playbackRate - 倍速
   * @param kw - 原始解析后的 kw
   * @returns 倍速处理后的 kw
   */
  static getPlaybackRateKW(playbackRate: number, kw: AeAKw) {
    const newKw = cloneKw(kw);
    newKw.ip = Math.round(newKw.ip / playbackRate);
    newKw.op = Math.round(newKw.op / playbackRate);
    const maxT = newKw.op;
    const minT = newKw.ip;
    calcT(minT, maxT, newKw.ks.o, playbackRate);
    calcT(minT, maxT, newKw.ks.r, playbackRate);
    calcT(minT, maxT, newKw.ks.p.x, playbackRate);
    calcT(minT, maxT, newKw.ks.p.y, playbackRate);
    calcT(minT, maxT, newKw.ks.a, playbackRate);
    calcT(minT, maxT, newKw.ks.s, playbackRate);
    return newKw;
  }

  /**
   * 将样式属性转成 transform 矩阵
   * @param frameStyle - ae 导出属性组成的 style
   * @param scale - ae 导出属性组成的 style
   */
  static getMatrixString(frameStyle: any, scale: number) {
    const x =
      (frameStyle.translateX -
        frameStyle.transformOriginX * frameStyle.scaleX) *
      scale;
    const y =
      (frameStyle.translateY -
        frameStyle.transformOriginY * frameStyle.scaleY) *
      scale;
    const rotate = (frameStyle.rotate / 180) * Math.PI;
    const rotateSin = Math.sin(rotate);
    const rotateCos = Math.cos(rotate);
    return `matrix(${frameStyle.scaleX * rotateCos}, ${
      frameStyle.scaleY * rotateSin
    }, ${frameStyle.scaleX * -rotateSin}, ${
      frameStyle.scaleY * rotateCos
    }, ${x}, ${y})`;
  }

  /**
   * 计算每一帧的最终css样式
   * @param target - 当前帧样式
   * @param scale - 缩放比例
   * @param lastMatrix - 用于计算的最后一帧的样式
   */
  static calcFrameCssStyle(
    key: string,
    frameStyles: any,
    { scale, aeA, startTime, endTime }: any,
  ) {
    let lastMatrix;
    // 逆向最后一帧的矩阵
    if (key === 'i') {
      const len = frameStyles[key].length;
      const lastFrameStyle = frameStyles[key][len - 1];
      if (!lastFrameStyle) {
        return;
      }
      lastMatrix = inverse(
        fromString(this.getMatrixString(lastFrameStyle, scale)),
      );
    }
    if (key === 'o' && aeA.s.kw) {
      const frames = Math.round(
        (endTime - startTime) / (this.frameInterval * 1000),
      );
      const len = frameStyles.s.length;
      const lastFrameStyle = frameStyles.s[Math.min(len - 1, frames)];
      if (!lastFrameStyle) {
        return;
      }
      lastMatrix = inverse(
        fromString(this.getMatrixString(lastFrameStyle, scale)),
      );
    }
    return frameStyles[key].map((item) => {
      let matrixString = this.getMatrixString(item, scale);
      if (lastMatrix) {
        // 和逆向矩阵合并，来反推基于动画开始时的位置
        const matrix = fromString(matrixString);
        const newMatrix = compose(lastMatrix, matrix);
        matrixString = toCSS(newMatrix);
      }
      return {
        opacity: item.opacity,
        transform: matrixString,
      };
    });
  }

  /**
   * 将 kw 转换为每一帧的样式数组
   * @param kw - 最终计算样式的 kw
   * @param isAea - 最终计算样式的 kw
   * @returns 返回计算后的 css 样式
   */
  static computeAnimation(kw: AeAKw, isAea: boolean) {
    const arr: Array<typeof defaultStyle> = [];
    arr.length = kw.op + 1; // 从 [0, kw.op] 区间为 kw.op + 1 帧
    for (let i = 0; i <= kw.op; i++) {
      arr[i] = { ...defaultStyle };
    }
    calcFrameStyle(arr, isAea, kw.op, kw.ks.o, ['opacity'], 1, 0.01);
    calcFrameStyle(arr, isAea, kw.op, kw.ks.r, ['rotate'], 1, 1);
    calcFrameStyle(arr, isAea, kw.op, kw.ks.p.x, ['translateX'], 1, 1);
    calcFrameStyle(arr, isAea, kw.op, kw.ks.p.y, ['translateY'], 1, 1);
    calcFrameStyle(
      arr,
      isAea,
      kw.op,
      kw.ks.a,
      ['transformOriginX', 'transformOriginY'],
      0,
      1,
    );
    calcFrameStyle(arr, isAea, kw.op, kw.ks.s, ['scaleX', 'scaleY'], 1, 0.01);
    return arr;
  }
}

export default class AnimationV1 extends AnimationV1Helper {
  /** 缓存同一个动效的计算结果（针对单个元素）- css transform */
  static animationAssetCss: any = {};

  static getAssetCss(resId: string) {
    return this.animationAssetCss[resId];
  }

  /**
   *  计算元素动画 i | s | o
   * @param as - 元素动画的 i | s | o 对象
   * @param isAea - 元素动画的 i | s | o 对象
   */

  static computeAssetAnimation(as: AeAItem, isAea: boolean) {
    const { resId, kw } = as;
    if (resId && kw && !this.animationAssetCss[resId]) {
      this.animationAssetCss[resId] = {};
      const results = this.computeAnimation(kw, isAea);
      this.animationAssetCss[resId] = results;
    }
  }

  /**
   将 css transform 转换为缩放后的矩阵
   * @param results - css transform 计算结果
   * @param t - 动画分类 i | s | o
   * @param scale - 画布缩放
   * @returns 返回矩阵数组
   */
  static computeAssetAnimationMatrix(
    results: TDefaultStyle[],
    t: 'i' | 's' | 'o' | 'p',
    scale: number,
  ) {
    if (t === 'i') {
      let i: {
        opacity: number;
        transform: string;
        transformOrigin: string;
      }[] = [];
      if (Array.isArray(results)) {
        i = results.map((style) => {
          const lastMatrix = inverse(
            fromString(
              this.getMatrixString(results[results.length - 1], scale),
            ),
          );
          return this.calcFrameCssStyle(style, scale, lastMatrix);
        });
      }
      return i;
    }
  }
}
