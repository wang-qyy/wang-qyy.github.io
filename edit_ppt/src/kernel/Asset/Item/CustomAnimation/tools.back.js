import { config } from '@kernel/utils/config';
import { cloneDeep } from 'lodash-es';
import { fromString, inverse, compose, toCSS } from 'transformation-matrix';
import { BezierFactory } from './Bezier';
// 通过使用 string[] 来控制 aeA 的遍历顺序, o 的矩阵计算 依赖 s 的结果

export const aeaKey = {
  i: 'i',
  s: 's',
  o: 'o',
};
export const aeAKeys = Object.keys(aeaKey);

export function cloneKw(kw) {
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

const startKeys = ['opacity', 'rotate', 'scaleX', 'scaleY', 'scaleZ'];
const kwDistanceKeys = ['translateX', 'translateY', 'translateZ'];
const aeADistanceKeys = [
  'translateX',
  'translateY',
  'translateZ',
  'transformOriginX',
  'transformOriginY',
  'transformOriginZ',
];
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
 * @param {object} keyFrame 关键帧对象
 * @param {0 | 1 | 2} index 取控制点的坐标的数组下标 x, y 为 [ number, number?, number? ]
 * @return { function } xPercentage => BezierEasingPercentage
 */
export const getFrameValueBezierEasing = (keyFrame, index) => {
  if (keyFrame.i && keyFrame.i.s) {
    return keyFrame.i
      ? BezierFactory.getBezierEasing(
          keyFrame.o.s[0],
          keyFrame.o.s[1],
          keyFrame.i.s[0],
          keyFrame.i.s[1],
        ).get
      : (v) => v;
  }
  return keyFrame.i
    ? BezierFactory.getBezierEasing(
        keyFrame.o.x[index],
        keyFrame.o.y[index],
        keyFrame.i.x[index],
        keyFrame.i.y[index],
      ).get
    : (v) => v;
};

export const calcT = (minT, maxT, attribute, playbackRate) => {
  // 倍速不会影响 BezierEasing 的参数，同样的起始和结束，对应的帧不同，ae 导出的 i, o 结果相同
  if (attribute.k[0] && typeof attribute.k[0].t === 'number') {
    attribute.k.forEach((item) => {
      item.t = Math.round(item.t / playbackRate);
      item.t = Math.max(minT, Math.min(item.t, maxT)); // 保证 t 在区间 [ip, op]
    });
  }
};

/**
 * 将原始 kw 深复制，并将帧数 t 根据倍速提前或者延后
 * @param {number} playbackRate
 * @param {object} kw
 * @return {kw}
 */
export const getPlaybackRateKW = (playbackRate, kw, aeA) => {
  const newKw = cloneKw(kw);
  newKw.ip = Math.round(newKw.ip / playbackRate);
  newKw.op = Math.round(newKw.op / playbackRate);
  const maxT = newKw.op;
  const minT = newKw.ip;

  if (aeA.animationType === 'pageAnimation') {
    newKw?.ks?.s?.y && calcT(minT, maxT, newKw.ks.s.y, playbackRate);
  } else {
    calcT(minT, maxT, newKw.ks.o, playbackRate);
    calcT(minT, maxT, newKw.ks.r, playbackRate);
    calcT(minT, maxT, newKw.ks.p.x, playbackRate);
    calcT(minT, maxT, newKw.ks.p.y, playbackRate);
    calcT(minT, maxT, newKw.ks.a, playbackRate);
    calcT(minT, maxT, newKw.ks.s, playbackRate);
  }
  return newKw;
};

export function getDuration(rateKwItem) {
  return Math.round(
    (rateKwItem.op - rateKwItem.ip) * config.frameInterval * 1000,
  );
}

/**
 * 计算出每一帧的具体样式
 * @param targetArray - 目标样式数组
 * @param attribute - kw.ks.属性
 * @param keys - 需要更新的属性名 opacity | rotate | (translateX, translateY, translateZ) | (transformOriginX, transformOriginY, transformOriginZ) | (scaleX, scaleY, scaleZ)
 * @param startRate - 计算中间帧属性值时是否需要加上初始帧的值
 * @param deltaRate - 转换成 css 属性需要的倍率
 */
function calcFrameStyleHelper(
  targetArray,
  isAeA,
  maxFrame,
  attribute,
  keys,
  startRate,
  deltaRate,
) {
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
}

/**
 * 计算出每一帧的具体样式
 * @param targetArray - 目标样式数组
 * @param attribute - kw.ks.属性
 * @param keys - 需要更新的属性名 opacity | rotate | (translateX, translateY, translateZ) | (transformOriginX, transformOriginY, transformOriginZ) | (scaleX, scaleY, scaleZ)
 * @param startRate - 计算中间帧属性值时是否需要加上初始帧的值
 * @param deltaRate - 转换成 css 属性需要的倍率
 */
function calcNewFrameStyleHelper(
  targetArray,
  attribute,
  keys,
  startRate,
  deltaRate,
) {
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

/*
 * 计算出每一帧的具体样式
 * @param {defaultStyle[]} targetArray
 * @param { boolean } isAeA
 * @param {number} maxFrame kw.op
 * @param {{a: number, k: []}} attribute kw.ks.属性
 * @param {string[]} keys 需要更新的属性名 opacity | rotate | (translateX, translateY, translateZ) | (transformOriginX, transformOriginY, transformOriginZ) | (scaleX, scaleY, scaleZ)
 * @param {0 | 1} startRate 计算中间帧属性值时是否需要加上初始帧的值
 * @param {number} deltaRate 转换成 css 属性需要的倍率
 */
export const calcFrameStyle = (
  targetArray,
  isAeA,
  maxFrame,
  attribute,
  keys,
  startRate,
  deltaRate,
  aeAKey,
) => {
  if (aeAKey.animationType === 'pageAnimation') {
    calcNewFrameStyleHelper(targetArray, attribute, keys, startRate, deltaRate);
  } else {
    calcFrameStyleHelper(
      targetArray,
      isAeA,
      maxFrame,
      attribute,
      keys,
      startRate,
      deltaRate,
    );
  }
};

/**
 * 将样式属性转成 transform 矩阵
 * @param { object } frameStyle ae 导出属性组成的 style
 * @param { number } scale ae 导出属性组成的 style
 * @param { boolean } isNewAea ae 导出属性组成的 style
 */
export const getMatrixString = (frameStyle, scale, isNewAea) => {
  const x = isNewAea
    ? frameStyle.translateX * scale
    : (frameStyle.translateX -
        frameStyle.transformOriginX * frameStyle.scaleX) *
      scale;
  const y = isNewAea
    ? frameStyle.translateY * scale
    : (frameStyle.translateY -
        frameStyle.transformOriginY * frameStyle.scaleY) *
      scale;
  // console.log(x, y);
  const rotate = (frameStyle.rotate / 180) * Math.PI;
  const rotateSin = Math.sin(rotate);
  const rotateCos = Math.cos(rotate);
  return `matrix(${frameStyle.scaleX * rotateCos}, ${
    frameStyle.scaleY * rotateSin
  }, ${frameStyle.scaleX * -rotateSin}, ${
    frameStyle.scaleY * rotateCos
  }, ${x}, ${y})`;
};

/**
 * @description 计算每一帧的最终css样式
 * @param {'i' | 's' | 'o'} key
 * @param frameStyles
 * @param isNewAea
 * @param scale
 * @param aeA
 * @param startTime
 * @param endTime
 */
export function calcFrameCssStyle(
  key,
  frameStyles,
  { scale, aeA, startTime, endTime },
) {
  const isNewAea = aeA[key].animationType === 'pageAnimation';
  let lastMatrix;
  // 逆向最后一帧的矩阵
  if (key === 'i') {
    const len = frameStyles[key].length;
    const lastFrameStyle = frameStyles[key][len - 1];
    if (!lastFrameStyle) {
      return;
    }
    lastMatrix = inverse(
      fromString(getMatrixString(lastFrameStyle, scale, isNewAea)),
    );
  }
  if (key === 'o' && aeA.s.kw) {
    const frames = Math.round(
      (endTime - startTime) / (config.frameInterval * 1000),
    );
    const len = frameStyles.s.length;
    const lastFrameStyle = frameStyles.s[Math.min(len - 1, frames)];
    if (!lastFrameStyle) {
      return;
    }
    lastMatrix = inverse(
      fromString(getMatrixString(lastFrameStyle, scale, isNewAea)),
    );
  }

  return frameStyles[key].map((item) => {
    let matrixString = getMatrixString(item, scale, isNewAea);
    if (lastMatrix) {
      // 和逆向矩阵合并，来反推基于动画开始时的位置
      const matrix = fromString(matrixString);
      const newMatrix = compose(lastMatrix, matrix);
      matrixString = toCSS(newMatrix);
    }
    const data = {
      opacity: item.opacity,
      transform: matrixString,
    };
    if (isNewAea) {
      data.transformOrigin = `${
        item.transformOriginX ? Math.abs(item.transformOriginX) : 50
      }% ${item.transformOriginY ? Math.abs(item.transformOriginY) : 50}%`;
    }
    return data;
  });
}
