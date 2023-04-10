import { inverse, compose, fromString, toCSS } from 'transformation-matrix';
import { BezierFactory } from './Bezier.js';
import {
  defaultStyle,
  startKeys,
  kwDistanceKeys,
  frameInterval,
} from './const';

/**
 * @description 将矩阵数组转化为矩阵对象
 * @param arr
 * @returns {{a: *, b: *, c: *, d: *, e: *, f: *}}
 */
function fromArray(arr) {
  const [a, b, c, d, e, f] = arr;
  return {
    a,
    b,
    c,
    d,
    e,
    f,
  };
}

/**
 * @description 将矩阵对象转化为矩阵数组
 * @param matrix
 * @returns {{a: *, b: *, c: *, d: *, e: *, f: *}}
 */
function matrixToArray(matrix) {
  const { a, b, c, d, e, f } = matrix;
  return [a, b, c, d, e, f];
}

// 通过使用 string[] 来控制 aeA 的遍历顺序, o 的矩阵计算 依赖 s 的结果
export function deepCloneJson(val) {
  let k;
  let out;
  let tmp;

  if (Array.isArray(val)) {
    out = Array((k = val.length));
    while (k--)
      out[k] =
        // eslint-disable-next-line no-cond-assign
        (tmp = val[k]) && typeof tmp === 'object' ? deepCloneJson(tmp) : tmp;
    return out;
  }

  if (Object.prototype.toString.call(val) === '[object Object]') {
    out = {}; // null
    for (k in val) {
      if (k === '__proto__') {
        Object.defineProperty(out, k, {
          value: deepCloneJson(val[k]),
          configurable: true,
          enumerable: true,
          writable: true,
        });
      } else {
        out[k] =
          // eslint-disable-next-line no-cond-assign
          (tmp = val[k]) && typeof tmp === 'object' ? deepCloneJson(tmp) : tmp;
      }
    }
    return out;
  }

  return val;
}

export function cloneKw(kw) {
  if (typeof kw === 'string') {
    return JSON.parse(kw);
  }
  return deepCloneJson(kw);
}

/**
 * 获取 BezierEasing 计算函数
 * @param {object} keyFrame 关键帧对象
 * @param {0 | 1 | 2} index 取控制点的坐标的数组下标 x, y 为 [ number, number?, number? ]
 * @return { function } xPercentage => BezierEasingPercentage
 */
export const getFrameValueBezierEasing = (keyFrame, index) => {
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
export const getPlaybackRateKW = (playbackRate, kw) => {
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
};

export function getDuration(rateKwItem) {
  return Math.round((rateKwItem.op - rateKwItem.ip) * frameInterval * 1000);
}

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
  targetArray,
  maxFrame,
  attribute,
  keys,
  startRate,
  deltaRate,
) => {
  const distanceKeys = kwDistanceKeys;
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
 * 将样式属性转成 transform 矩阵
 * @param { object } frameStyle ae 导出属性组成的 style
 * @param { number } scale ae 导出属性组成的 style
 */
export const getMatrixString = (frameStyle, scale = 1) => {
  const {
    translateX = 0,
    translateY = 0,
    transformOriginX = 0,
    transformOriginY = 0,
    scaleX = 1,
    scaleY = 1,
  } = frameStyle;
  const x = (translateX - transformOriginX * scaleX) * scale;
  const y = (translateY - transformOriginY * scaleY) * scale;
  const rotate = (frameStyle.rotate / 180) * Math.PI;
  const rotateSin = Math.sin(rotate);
  const rotateCos = Math.cos(rotate);

  return `matrix(${scaleX * rotateCos}, ${scaleY * rotateSin}, ${
    scaleX * -rotateSin
  }, ${scaleY * rotateCos}, ${x}, ${y})`;
};

/**
 * @description 计算每一帧的最终css样式
 * @param {'i' | 's' | 'o'} key
 * @param frameStyles
 * @param scale
 * @param stay
 */
export function calcFrameCssStyle(key, frameStyles, { scale, stay }) {
  if (!frameStyles?.[key].length) {
    return;
  }
  let lastMatrix;
  // 逆向最后一帧的矩阵
  if (key === 'i') {
    const len = frameStyles[key].length;
    const lastFrameStyle = frameStyles[key][len - 1];
    if (!lastFrameStyle) {
      return;
    }
    lastMatrix = inverse(fromString(getMatrixString(lastFrameStyle, scale)));
  }
  if (key === 'o' && frameStyles.s.length) {
    const frames = Math.round(stay / (frameInterval * 1000));
    const len = frameStyles.s.length;
    const lastFrameStyle = frameStyles.s[Math.min(len - 1, frames)];
    if (!lastFrameStyle) {
      return;
    }
    lastMatrix = inverse(fromString(getMatrixString(lastFrameStyle, scale)));
  }
  return frameStyles[key].map((item) => {
    let matrixString = getMatrixString(item, scale);
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

export function computeAnimation(kw) {
  const arr = [];
  for (let i = 0; i <= kw.op; i++) {
    arr[i] = { ...defaultStyle };
  }
  calcFrameStyle(arr, kw.op, kw.ks.o, ['opacity'], 1, 0.01);
  calcFrameStyle(arr, kw.op, kw.ks.r, ['rotate'], 1, 1);
  calcFrameStyle(arr, kw.op, kw.ks.p.x, ['translateX'], 1, 1);
  calcFrameStyle(arr, kw.op, kw.ks.p.y, ['translateY'], 1, 1);
  calcFrameStyle(
    arr,
    kw.op,
    kw.ks.a,
    ['transformOriginX', 'transformOriginY'],
    0,
    1,
  );
  calcFrameStyle(arr, kw.op, kw.ks.s, ['scaleX', 'scaleY'], 1, 0.01);
  return arr;
}
