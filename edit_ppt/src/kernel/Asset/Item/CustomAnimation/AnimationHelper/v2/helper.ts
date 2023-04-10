import { fromString, inverse, compose, toCSS } from 'transformation-matrix';
import { BezierFactory } from '@kernel/Asset/Item/CustomAnimation/Bezier';
import { IKs, IKeyFrame, Assets, Ikw } from '@kernel/typing';
import { deepCloneJson as cloneDeep } from '@kernel/utils/single';
import { config } from '@kernel/utils/config';
import { IPageAnimation, ICanvas, IAssetAnimation } from './typing';

export function getDuration(rateKwItem: Ikw) {
  return Math.round(
    (rateKwItem.op - rateKwItem.ip) * config.frameInterval * 1000,
  );
}

interface IKw {
  ip: number;
  op: number;
  ks: IKs;
}

const defaultStyle: {
  opacity: number;
  transformOriginX?: number;
  transformOriginY?: number;
  rotate: number;
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
} = {
  opacity: 1,
  transformOriginX: undefined,
  transformOriginY: undefined,
  rotate: 0,
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
};

export type TDefaultStyle = typeof defaultStyle;

/** 需要计算第一帧初始值的属性 */
const startKeys = ['opacity', 'rotate', 'scaleX', 'scaleY', 'scaleZ'];
/** 需要计算第一帧和最后一帧间距离变化量的属性 */
// const kwDistanceKeys = ["translateX", "translateY", "translateZ"];
/** 需要计算第一帧和最后一帧间距离变化量的属性 */
const AEADistanceKeys = [
  'translateX',
  'translateY',
  'translateZ',
  // 'transformOriginX',
  // 'transformOriginY',
  // 'transformOriginZ',
];

/**
 * 获取 BezierEasing 计算函数
 * @param keyFrame - 关键帧对象
 * @param index - 取控制点的坐标的数组下标 x, y 为 [ number, number?, number? ]
 * @returns frameTimePercentage =\> BezierEasingPercentage
 */
const getFrameValueBezierEasing = (
  keyFrame: IKeyFrame,
  index: 0 | 1 | 2,
): ((v: number) => number) => {
  return keyFrame.i
    ? BezierFactory.getBezierEasing(
        keyFrame.o!.s[0] || 0,
        keyFrame.o!.s[1] || 0,
        keyFrame.i.s[0],
        keyFrame.i.s[1],
      ).get
    : (v: number) => v;
};

/**
 * 由于倍速影响整个动画总帧数，转换每个关键帧数据的对应帧
 * @param minT - 最小帧
 * @param maxT - 最大帧
 * @param attribute - 属性
 * @param playbackRate - 倍速
 */
const calcT = (
  minT: number,
  maxT: number,
  attribute: { k: IKeyFrame[] },
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
 * @param targetArray - 目标样式数组
 * @param attribute - kw.ks.属性
 * @param keys - 需要更新的属性名 opacity | rotate | (translateX, translateY, translateZ) | (transformOriginX, transformOriginY, transformOriginZ) | (scaleX, scaleY, scaleZ)
 * @param startRate - 计算中间帧属性值时是否需要加上初始帧的值
 * @param deltaRate - 转换成 css 属性需要的倍率
 */
const calcFrameStyle = (
  targetArray: TDefaultStyle[],
  attribute: {
    k: IKeyFrame[];
  },
  keys: string[],
  startRate: 0 | 1,
  deltaRate: number,
) => {
  const distanceKeys = AEADistanceKeys;
  let initDistance = [0, 0, 0];
  if (attribute.k.length > 0) {
    const data = attribute.k;
    const dataLength = data.length;
    if (distanceKeys.includes(keys[0])) {
      initDistance = data[0].s;
    }
    for (let i = 0; i < dataLength - 1; i++) {
      const start = data[i];
      const end = data[i + 1];
      const deltaT = end.t - start.t;
      const deltaS = [0, 0, 0];
      deltaS[0] = end.s[0] - start.s[0];
      keys[1] && (deltaS[1] = end.s[1] - start.s[1]);
      keys[2] && (deltaS[2] = end.s[2] - start.s[2]);
      const getFrameValue: ((v: number) => number)[] = [];
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
};

/**
 * 计算 AE 导出的动画属性的静态类
 */
export class AnimationV2Helper {
  /** 动画每秒帧数 */
  static baseFrame = 30;

  /** 通过使用 string[] 来控制 aeA 的遍历顺序, o 的矩阵计算 依赖 s 的结果 */
  static keyMap: ['i', 's', 'o'] = ['i', 's', 'o'];

  /** 缓存同一个动画的计算结果 - css transform 格式 */
  static animationCss: Record<
    string,
    { c?: TDefaultStyle[][]; m?: TDefaultStyle[][] }
  > = {};

  /** 缓存同一个动画的计算结果 - css transform Matrix 格式 */
  // static animationMatrix: Record<string, { opacity: number; transform: ReturnType<typeof compose> }[][]> = {};

  static pageAnimationAllocation: Record<
    number,
    {
      i: {
        [key: string]: { m?: number; c?: number; t?: number; delay?: number };
      };
      s: {
        [key: string]: { m?: number; c?: number; t?: number; delay?: number };
      };
      o: {
        [key: string]: { m?: number; c?: number; t?: number; delay?: number };
      };
      p: {
        [key: string]: { m?: number; c?: number; t?: number; delay?: number };
      };
    }
  > = {};

  static pageAnimationAllocationTimer: Record<
    string,
    { timer: number; t: 'i' | 's' | 'o' | 'p' }
  > = {};

  static getCss(resId: string) {
    return this.animationCss[resId];
  }

  /**
   * 将原始 kw 深复制，并将帧数 t 根据倍速提前或者延后
   * @param playbackRate - 倍速
   * @param kw - 原始解析后的 kw
   * @returns 倍速处理后的 kw
   */
  static getPlaybackRateKW(playbackRate: number, kw: IKw) {
    const newKw = cloneDeep(kw);
    newKw.ip = Math.round(newKw.ip / playbackRate);
    newKw.op = Math.round(newKw.op / playbackRate);
    const maxT = newKw.op;
    const minT = newKw.ip;
    // newKw.ks?.o && calcT(minT, maxT, newKw.ks.o, playbackRate);
    // newKw.ks?.r && calcT(minT, maxT, newKw.ks.r, playbackRate);
    // newKw.ks?.p?.x && calcT(minT, maxT, newKw.ks.p.x, playbackRate);
    // newKw.ks?.p?.y && calcT(minT, maxT, newKw.ks.p.y, playbackRate);
    // newKw.ks?.s?.x && calcT(minT, maxT, newKw.ks.s.x, playbackRate);
    newKw.ks?.s?.y && calcT(minT, maxT, newKw.ks.s.y, playbackRate);
    return newKw;
  }

  /**
   * 将样式属性转成 transform 矩阵
   * @param frameStyle - ae 导出属性组成的 style
   * @param scale - ae 导出属性组成的 style
   */
  static getMatrixString(
    frameStyle: {
      translateX: number;
      translateY: number;
      transformOriginX?: number;
      transformOriginY?: number;
      scaleX: number;
      scaleY: number;
      rotate: number;
    },
    scale: number,
  ) {
    const x =
      frameStyle.translateX /* - (frameStyle.transformOriginX ?? 0) * frameStyle.scaleX */ *
      scale;
    const y =
      frameStyle.translateY /* - (frameStyle.transformOriginY ?? 0) * frameStyle.scaleY */ *
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
    target: TDefaultStyle,
    scale = 1,
    lastMatrix: {
      a: number;
      b: number;
      c: number;
      d: number;
      e: number;
      f: number;
    },
  ) {
    let matrixString = this.getMatrixString(target, scale);
    if (lastMatrix) {
      // 和逆向矩阵合并，来反推基于动画开始时的位置
      const matrix = fromString(matrixString);
      const newMatrix = compose(lastMatrix, matrix);
      matrixString = toCSS(newMatrix);
    }
    return {
      opacity: target.opacity,
      transform: matrixString,
      transformOrigin: `${target.transformOriginX ?? 50}% ${
        target.transformOriginY ?? 50
      }%`,
    };
    // return `opacity: ${target.opacity}; transform: ${matrixString}`;
  }

  /**
   * 将 kw 转换为每一帧的样式数组
   * @param kw - 最终计算样式的 kw
   * @returns 返回计算后的 css 样式
   */
  static computeAnimation(kw: IKw) {
    const arr = [];
    arr.length = kw.op + 1; // 从 [0, kw.op] 区间为 kw.op + 1 帧
    for (let i = 0; i <= kw.op; i++) {
      arr[i] = { ...defaultStyle };
    }
    kw.ks?.a &&
      calcFrameStyle(
        arr,
        kw.ks.a,
        ['transformOriginX', 'transformOriginY'],
        1,
        1,
      );
    kw.ks?.o && calcFrameStyle(arr, kw.ks.o, ['opacity'], 1, 1);
    kw.ks?.r && calcFrameStyle(arr, kw.ks.r, ['rotate'], 1, 1);
    kw.ks?.p?.x && calcFrameStyle(arr, kw.ks.p.x, ['translateX'], 1, 1);
    kw.ks?.p?.y && calcFrameStyle(arr, kw.ks.p.y, ['translateY'], 1, 1);
    kw.ks?.s?.x && calcFrameStyle(arr, kw.ks.s.x, ['scaleX'], 1, 1);
    kw.ks?.s?.y && calcFrameStyle(arr, kw.ks.s.y, ['scaleY'], 1, 1);
    return arr;
  }

  /**
   * 计算页面动画的 i | s | o
   * @param pa - 页面动画的 i | s | o 对象
   */
  static computePageAnimation(pa: IPageAnimation) {
    if (!this.animationCss[pa.resId!]) {
      this.animationCss[pa!.resId!] = {};
      ['c', 'm'].forEach((key: 'c' | 'm') => {
        if (pa.kws?.[key]) {
          const results = pa.kws[key].map((kw) => {
            const r = this.computeAnimation(kw);
            return r;
          });
          this.animationCss[pa.resId!][key] = results;
        }
      });
    }
  }

  /**
   * 将 css transform 转换为缩放后的矩阵
   * @param results - css transform 计算结果
   * @param t - 动画分类 i | s | o
   * @param scale - 画布缩放
   * @returns 返回矩阵数组
   */
  static computePageAnimationMatrix(
    results: {
      c?: TDefaultStyle[][];
      m?: TDefaultStyle[][];
      t?: TDefaultStyle[][];
    },
    t: 'i' | 's' | 'o' | 'p',
    scale: number,
  ) {
    switch (t) {
      case 'p':
      case 'i': {
        const m: {
          c?: {
            opacity: number;
            transform: string;
          }[][];
          m?: {
            opacity: number;
            transform: string;
          }[][];
          t?: {
            opacity: number;
            transform: string;
          }[][];
        } = {};
        ['c', 'm', 't'].forEach((key: 'c' | 'm' | 't') => {
          if (results[key]) {
            m[key] = results[key].map((styles) => {
              const lastMatrix = inverse(
                fromString(
                  this.getMatrixString(styles[styles.length - 1], scale),
                ),
              );
              return styles.map((style) => {
                return this.calcFrameCssStyle(style, scale, lastMatrix);
              });
            });
          }
        });
        return m;
      }
      case 's':
        break;
      case 'o':
        break;
      default:
        break;
    }
  }

  /**
   * 计算分配元素动画
   * @param pageIndex - 页面索引
   * @param t - 动画分类 i | s | o
   * @param pageAnimation - 页面动画具体信息
   * @param animationStyles - 最终的动画属性数组
   * @param canvas - 计算播放顺序用
   * @param pageAssets - 页面内元素
   */
  static allocatePageAnimation(
    pageIndex: number,
    t: 'i' | 's' | 'o' | 'p',
    pageAnimation: IPageAnimation,
    animationStyles: {
      c?: {
        opacity: number;
        transform: string;
      }[][];
      m?: {
        opacity: number;
        transform: string;
      }[][];
      t?: {
        opacity: number;
        transform: string;
      }[][];
    },
    canvas: ICanvas,
    isForce: boolean,
    pageAssets: Assets,
  ) {
    const { resId } = pageAnimation;
    if (resId) {
      if (
        !isForce &&
        this.pageAnimationAllocationTimer[resId]?.timer &&
        this.pageAnimationAllocationTimer[resId]?.t === t
      ) {
        // 减少重复计算
        return this.pageAnimationAllocation;
      }
      if (this.pageAnimationAllocationTimer[resId]?.timer) {
        clearTimeout(this.pageAnimationAllocationTimer[resId]?.timer);
      }
      this.pageAnimationAllocationTimer[resId] = {
        timer: window.setTimeout(() => {
          this.pageAnimationAllocationTimer[resId] = undefined;
        }, 800),
        t,
      };
    }

    const assetsInfo = pageAssets.map((a) => {
      return {
        className: a.meta.className,
        type: a.meta.type,
        group: a.meta.group,
        width: parseFloat(`${a.attribute.width}`),
        heigth: parseFloat(`${a.attribute.height}`),
        zIndex: parseFloat(`${a.meta.index}`),
        x: parseFloat(`${a.transform.posX}`),
        y: parseFloat(`${a.transform.posY}`),
        cx:
          parseFloat(`${a.transform.posX}`) +
          parseFloat(`${a.attribute.width}`) / 2,
        cy:
          parseFloat(`${a.transform.posY}`) +
          parseFloat(`${a.attribute.height}`) / 2,
        cIndex: undefined,
      };
    });
    const canvasCx = canvas.width / 2;
    const canvasCy = canvas.height / 2;
    switch (pageAnimation.pi) {
      case 1:
        assetsInfo.sort((a, b) => a.y - b.y);
        break;
      case 2:
        assetsInfo.sort((a, b) => canvas.width - a.x - (canvas.width - b.x));
        break;
      case 3:
        assetsInfo.sort((a, b) => canvas.height - a.y - (canvas.height - b.y));
        break;
      case 4:
        assetsInfo.sort((a, b) => a.x - b.x);
        break;
      case 5:
        assetsInfo.sort((a, b) => b.zIndex - a.zIndex);
        break;
      case 6:
        assetsInfo.sort((a, b) => a.zIndex - b.zIndex);
        break;
      case 7:
        assetsInfo.sort((a, b) => a.zIndex - b.zIndex);
        for (const i of assetsInfo) {
          if (i.cx <= canvasCx) {
            i.cIndex = 0;
          } else {
            i.cIndex = 1;
          }
        }
        break;
      case 8:
        assetsInfo.sort((a, b) => a.zIndex - b.zIndex);
        for (const i of assetsInfo) {
          if (i.cx <= canvasCx && i.cy <= canvasCy) {
            i.cIndex = 0; // 左上
          } else if (i.cx > canvasCx && i.cy <= canvasCy) {
            i.cIndex = 1; // 右上
          } else if (i.cx <= canvasCx && i.cy > canvasCy) {
            i.cIndex = 2; // 左下
          } else if (i.cx > canvasCx && i.cy > canvasCy) {
            i.cIndex = 3; // 右下
          }
        }
        break;
      default:
        break;
    }
    const len = assetsInfo.length;
    const allocation: Record<
      string,
      { m?: number; c?: number; t?: number; delay?: number }
    > = {};
    const delayLen = pageAnimation.d.s.length;
    let cCount = 0;
    let textCount = 0;
    let mainCount = 0;
    let groupCount = 0;
    let delayTotal = 0;
    let cLen = 0;
    let tLen = 0;
    if (animationStyles.c) {
      cLen = animationStyles.c.length;
    }
    if (animationStyles.t) {
      tLen = animationStyles.t.length;
    }
    const isDelayMax20 = ['2', '7', '9'].includes(pageAnimation.resId);
    for (let index = 0; index < len; index++) {
      const { className } = assetsInfo[index];
      if (assetsInfo[index].group || assetsInfo[index].type === 'group') {
        if (
          pageAnimation.kwst === 2 &&
          animationStyles.m &&
          mainCount === 0 &&
          assetsInfo[index].type !== 'group'
        ) {
          allocation[className] = {
            m: 0,
            delay: index >= 20 && isDelayMax20 ? 20 : delayTotal,
          };
          mainCount++;
          delayTotal += pageAnimation.d.s[(index - groupCount) % delayLen];
        } else if (assetsInfo[index].type === 'text' && pageAnimation.kws.t) {
          if (allocation[assetsInfo[index].group]) {
            allocation[className] = {
              t: allocation[assetsInfo[index].group].t,
              delay: index >= 20 && isDelayMax20 ? 20 : delayTotal,
            };
          } else {
            allocation[className] = {
              t: (index - mainCount - cCount) % tLen,
              delay: index >= 20 && isDelayMax20 ? 20 : delayTotal,
            };
            textCount++;
            delayTotal += pageAnimation.d.s[(index - groupCount) % delayLen];
          }
        } else {
          if (allocation[assetsInfo[index].group]) {
            allocation[className] = {
              c: allocation[assetsInfo[index].group].c,
              delay: index >= 20 && isDelayMax20 ? 20 : delayTotal,
            };
          } else if (pageAnimation.kws.c) {
            allocation[className] = {
              c:
                assetsInfo[index].cIndex ??
                (index - mainCount - textCount) % cLen,
              delay: index >= 20 && isDelayMax20 ? 20 : delayTotal,
            };
            cCount++;
            delayTotal += pageAnimation.d.s[(index - groupCount) % delayLen];
          }
        }
        if (
          assetsInfo[index].type !== 'group' &&
          !allocation[assetsInfo[index].group]
        ) {
          if (!allocation[assetsInfo[index].group]) {
            allocation[assetsInfo[index].group] = {};
          }
          if (!allocation[assetsInfo[index].group].c) {
            allocation[assetsInfo[index].group].c = allocation[className].c;
          }
          if (!allocation[assetsInfo[index].group].m) {
            allocation[assetsInfo[index].group].m = allocation[className].m;
          }
          if (!allocation[assetsInfo[index].group].t) {
            allocation[assetsInfo[index].group].t = allocation[className].t;
          }
        }
        groupCount++;
      } else {
        if (
          pageAnimation.kwst === 2 &&
          animationStyles.m &&
          mainCount === 0 &&
          assetsInfo[index].type !== 'group'
        ) {
          allocation[className] = {
            m: 0,
            delay: index >= 20 && isDelayMax20 ? 20 : delayTotal,
          };
          mainCount++;
        } else if (assetsInfo[index].type === 'text' && pageAnimation.kws.t) {
          allocation[className] = {
            t: (index - mainCount - cCount) % tLen,
            delay: index >= 20 && isDelayMax20 ? 20 : delayTotal,
          };
          textCount++;
        } else if (pageAnimation.kws.c) {
          allocation[className] = {
            c:
              assetsInfo[index].cIndex ??
              (index - mainCount - textCount) % cLen,
            delay: index >= 20 && isDelayMax20 ? 20 : delayTotal,
          };
          cCount++;
        }
        delayTotal += pageAnimation.d.s[(index - groupCount) % delayLen];
      }
    }
    this.pageAnimationAllocation[pageIndex] = {
      ...this.pageAnimationAllocation[pageIndex],
      [t]: allocation,
    };
    // console.log(this.pageAnimationAllocation);
    return this.pageAnimationAllocation;
  }
}

export class AnimationV2 extends AnimationV2Helper {
  /** 缓存同一个动效的计算结果（针对单个元素）- css transform */
  static animationAssetCss: any = {};

  static getAssetCss(resId: string) {
    return this.animationAssetCss[resId];
  }

  /**
   * 将样式属性转成 transform 矩阵
   * @param frameStyle - ae 导出属性组成的 style
   * @param scale - ae 导出属性组成的 style
   */
  static getMatrixString(
    frameStyle: {
      translateX: number;
      translateY: number;
      transformOriginX?: number;
      transformOriginY?: number;
      scaleX: number;
      scaleY: number;
      rotate: number;
    },
    scale: number,
  ) {
    const x =
      frameStyle.translateX /* - (frameStyle.transformOriginX ?? 0) * frameStyle.scaleX */ *
      scale;
    const y =
      frameStyle.translateY /* - (frameStyle.transformOriginY ?? 0) * frameStyle.scaleY */ *
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
    target: TDefaultStyle,
    scale = 1,
    lastMatrix: {
      a: number;
      b: number;
      c: number;
      d: number;
      e: number;
      f: number;
    },
  ) {
    let matrixString = this.getMatrixString(target, scale);
    if (lastMatrix) {
      // 和逆向矩阵合并，来反推基于动画开始时的位置
      const matrix = fromString(matrixString);
      const newMatrix = compose(lastMatrix, matrix);
      matrixString = toCSS(newMatrix);
    }
    return {
      opacity: target.opacity,
      transform: matrixString,
      transformOrigin: `${target.transformOriginX ?? 50}% ${
        target.transformOriginY ?? 50
      }%`,
    };
    // return `opacity: ${target.opacity}; transform: ${matrixString}`;
  }

  /**
   *  计算元素动画 i | s | o
   * @param as - 元素动画的 i | s | o 对象
   */

  static computeAssetAnimation(as: IAssetAnimation) {
    const { resId, kw } = as;
    if (!this.animationAssetCss[resId]) {
      this.animationAssetCss[resId] = {};
      const results = this.computeAnimation(kw);
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
    let data: {
      opacity: number;
      transform: string;
      transformOrigin: string;
    }[] = [];
    if (Array.isArray(results)) {
      data = results.map((style) => {
        const lastMatrix = inverse(
          fromString(this.getMatrixString(results[results.length - 1], scale)),
        );
        return this.calcFrameCssStyle(style, scale, lastMatrix);
      });
    }
    return data;
  }
}
