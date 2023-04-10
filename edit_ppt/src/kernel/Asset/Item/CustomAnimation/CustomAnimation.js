import React, { PureComponent } from 'react';
import { canvasStore } from '@src/redux/CanvasStore';
import { paintOnCanvas } from '@component/canvas/CanvasRedux';
import cloneDeep from 'lodash/cloneDeep';
import equal from 'lodash/isEqual';
import { fromString, inverse, compose, toCSS } from 'transformation-matrix';
import { baseFrames } from '../canvas/canvasVideo/CanvasVideoPanel';
import { BezierFactory } from './Bezier';
import { emitter } from '../Emitter';
import AeALoader from './aeALoader';

const defaultStyle = {
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

/** @types {object} 用于在没有 asset.attribute.aeA 时提供默认动画播放速度 */
export const defaultPlaybackRate = {
  i: {
    pbr: 1,
  },
  s: {
    pbr: 1,
  },
  o: {
    pbr: 1,
  },
};

/**
 * 获取 BezierEasing 计算函数
 * @param {object} keyFrame 关键帧对象
 * @param {0 | 1 | 2} index 取控制点的坐标的数组下标 x, y 为 [ number, number?, number? ]
 * @return { function } xPercentage => BezierEasingPercentage
 */
const getFrameValueBezierEasing = (keyFrame, index) => {
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

/**
 * 将原始 kw 深复制，并将帧数 t 根据倍速提前或者延后
 * @param {number} playbackRate
 * @param {object} kw
 * @return {kw}
 */
const getPlaybackRateKW = (playbackRate, kw, aeAkey) => {
  const newKw = cloneDeep(kw);
  newKw.ip = Math.round(newKw.ip / playbackRate);
  newKw.op = Math.round(newKw.op / playbackRate);
  const maxT = newKw.op;
  const minT = newKw.ip;

  if (aeAkey.animationType === 'pageAnimation') {
    newKw.ks &&
      newKw.ks.s &&
      newKw.ks.s.y &&
      calcT(minT, maxT, newKw.ks.s.y, playbackRate);
  } else {
    newKw.ks && newKw.ks.o && calcT(minT, maxT, newKw.ks.o, playbackRate);
    newKw.ks && newKw.ks.r && calcT(minT, maxT, newKw.ks.r, playbackRate);
    newKw.ks &&
      newKw.ks.p &&
      newKw.ks.p.x &&
      calcT(minT, maxT, newKw.ks.p.x, playbackRate);
    newKw.ks &&
      newKw.ks.p &&
      newKw.ks.p.y &&
      calcT(minT, maxT, newKw.ks.p.y, playbackRate);
    newKw.ks && newKw.ks.a && calcT(minT, maxT, newKw.ks.a, playbackRate);
    newKw.ks && newKw.ks.s && calcT(minT, maxT, newKw.ks.s, playbackRate);
  }
  return newKw;
};

const calcT = (minT, maxT, attribute, playbackRate) => {
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
 * @param {{a: number, k: []}} attribute kw.ks.属性
 * @param {string[]} keys 需要更新的属性名 opacity | rotate | (translateX, translateY, translateZ) | (transformOriginX, transformOriginY, transformOriginZ) | (scaleX, scaleY, scaleZ)
 * @param {0 | 1} startRate 计算中间帧属性值时是否需要加上初始帧的值
 * @param {number} deltaRate 转换成 css 属性需要的倍率
 */
const calcFrameStyle = (
  targetArray,
  isAeA,
  maxFrame,
  attribute,
  keys,
  startRate,
  deltaRate,
  aeAkey,
) => {
  let distanceKeys;
  if (aeAkey.animationType === 'pageAnimation') {
    distanceKeys = ['translateX', 'translateY', 'translateZ'];
  } else {
    distanceKeys = isAeA ? aeADistanceKeys : kwDistanceKeys;
  }
  // let distanceKeys = isAeA ? aeADistanceKeys : kwDistanceKeys;
  let initDistance = [0, 0, 0];
  if (aeAkey.animationType === 'pageAnimation') {
    if (attribute.k.length > 0) {
      const data = attribute.k;
      const dataLength = data.length;
      if (distanceKeys.includes(keys[0])) {
        initDistance = data[0].s;
      }
      for (let i = 0; i < dataLength - 1; i++) {
        console.log(data);

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
  } else {
    if (attribute.a === 0) {
      // k = [ number, number, number ]
      if (distanceKeys.includes(keys[0])) {
        initDistance = attribute.k;
      }
      for (let i = 0; i <= maxFrame; i++) {
        targetArray[i][keys[0]] =
          (attribute.k[0] - initDistance[0]) * deltaRate;
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
          targetArray[i][keys[0]] =
            (data[0].s[0] - initDistance[0]) * deltaRate;
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
};

/**
 * 将样式属性转成 transform 矩阵
 * @param { object } frameStyle ae 导出属性组成的 style
 * @param { number } scale ae 导出属性组成的 style
 */
const getMatrixString = (frameStyle, scale) => {
  frameStyle = frameStyle || { ...defaultStyle };
  const x =
    (frameStyle.translateX - frameStyle.transformOriginX * frameStyle.scaleX) *
    scale;
  const y =
    (frameStyle.translateY - frameStyle.transformOriginY * frameStyle.scaleY) *
    scale;
  const rotate = (frameStyle.rotate / 180) * Math.PI;
  const rotateSin = Math.sin(rotate);
  const rotateCos = Math.cos(rotate);
  return `matrix(${frameStyle.scaleX * rotateCos}, ${
    frameStyle.scaleY * rotateSin
  }, ${frameStyle.scaleX * -rotateSin}, ${
    frameStyle.scaleY * rotateCos
  }, ${x}, ${y})`;
};

// 通过使用 string[] 来控制 aeA 的遍历顺序, o 的矩阵计算 依赖 s 的结果
const aeAKeys = ['i', 's', 'o'];

export default class CustomAnimation extends PureComponent {
  constructor(props) {
    super(props);
    if (!props.asset) {
      return;
    }
    this.isTimeLine =
      props.assetProps && props.assetProps.classTag === 'isFromVernier'; // 如果元素从在时间轴上渲染，则不考虑动画
    const {
      kw,
      aeA = defaultPlaybackRate,
      startTime,
      endTime,
    } = props.asset.attribute;
    if (!this.isTimeLine) {
      this.isAeA = true;
      if (kw) {
        this.isAeA = false;
        this.beforeComputeAnimation(aeA.s.pbr, kw, 's', aeA.s);
      }
      for (const i of aeAKeys) {
        // aeA[i].kw 在保存时, 不进入数据库
        if (
          aeA[i].resId &&
          (aeA[i].resId !== this.oldKw[i].resId || !aeA[i].kw)
        ) {
          this.oldKw[i].resId = aeA[i].resId;
          if (aeA[i].animationType !== 'pageAnimation') {
            AeALoader.get(aeA[i].resId, props.asset.meta.className, (data) => {
              canvasStore.dispatch(
                paintOnCanvas('VIDEO_UPDATE_AEAKW', {
                  data,
                  animationKey: i,
                  className: props.asset.meta.className,
                  animationType: 'assetAnimation',
                }),
              );
            });
          }
        }
        if (
          aeA[i].kw &&
          (!equal(this.oldKw[i].kw, aeA[i].kw) ||
            this.oldPlaybackRate[i] !== aeA[i].pbr)
        ) {
          this.beforeComputeAnimation(aeA[i].pbr, aeA[i].kw, i, aeA[i]);
        }
      }
    }
    this.oldTime = {
      s: startTime,
      e: endTime,
    };

    this.controlAnimationEmitter();
    this.changeLottieShowEmitter();
  }

  state = {
    styles: {
      i: [],
      s: [],
      o: [],
    },
    hoverStyles: [],
    frameCount: 0,
    lottieShow: false,
    lottieShowCs: 0,
    lottiePreview: false,
  };

  frameInterval = 1 / baseFrames; // 存在循环引用 导致无法提升成外部常量

  frameStyles = {
    i: [],
    s: [],
    o: [],
  };

  oldScale = 1;

  oldKw = {
    i: { resId: '' }, // 有数据时是 { resId: string, kw: object }
    s: { resId: '' },
    o: { resId: '' },
  };

  rateKw = {
    i: {},
    s: {},
    o: {},
  };

  oldPlaybackRate = {
    i: 1,
    s: 1,
    o: 1,
  };

  // 单位 ms
  duration = {
    i: 0,
    s: 0,
    o: 0,
  };

  oldTime = {
    s: 0,
    e: 0,
  };

  controlAnimationEmitter() {
    const th = this;
    this.controlAnimationEmitter = emitter.addListener(
      'controlHoverAnimation',
      (state) => {
        // 动画预览 跳过时间点判断 直接执行一次
        if (
          this.props.asset &&
          this.props.asset.meta.executeAnimation &&
          this.props.asset.meta.executeAnimation == 2
        ) {
          if (this.executeAnimationTime) {
            clearInterval(this.executeAnimationTime);
          }
          this.setState({
            frameCount: 0,
            hoverStyles: [],
          });
        }
        if (
          this.props.asset &&
          this.props.asset.meta.executeAnimation &&
          this.props.asset.meta.executeAnimation == 1 &&
          this.props.asset.meta.hoverAnimationKw
        ) {
          if (this.executeAnimationTime) {
            clearInterval(this.executeAnimationTime);
          }
          this.executeAnimationHover();
        }
      },
    );
  }

  /**
   * 在开始计算每帧的位置前, 记录状态
   * @param {number} playbackRate
   * @param {object} kw
   * @param {'i' | 's' | 'o'} key
   */
  beforeComputeAnimation = (playbackRate, kw, key, aeAkey) => {
    this.rateKw[key] = getPlaybackRateKW(playbackRate, kw, aeAkey);
    this.oldPlaybackRate[key] = playbackRate;
    this.oldKw[key].kw = cloneDeep(kw);
    this.duration[key] = Math.round(
      (this.rateKw[key].op - this.rateKw[key].ip) * this.frameInterval * 1000,
    );
    // 判断属性变化使用原始 kw, 计算样式使用 rateKw
    this.computeAnimation(this.rateKw[key], key, aeAkey);
  };

  /**
   * 根据动画参数计算出每帧的位置
   * @param {object} kw asset.attribute.kw
   * @param {'i' | 's' | 'o'} key
   */
  computeAnimation = (kw, key, aeAkey) => {
    const arr = [];
    arr.length = kw.op + 1; // 从 [0, kw.op] 区间为 kw.op + 1 帧

    for (let i = 0; i <= kw.op; i++) {
      if (aeAkey.animationType === 'pageAnimation') {
        arr[i] = {
          opacity: 1,
          transformOriginX: undefined,
          transformOriginY: undefined,
          rotate: 0,
          translateX: 0,
          translateY: 0,
          scaleX: 1,
          scaleY: 1,
        };
      } else {
        arr[i] = { ...defaultStyle };
      }
    }
    kw.ks &&
      kw.ks.r &&
      calcFrameStyle(arr, this.isAeA, kw.op, kw.ks.r, ['rotate'], 1, 1, aeAkey);
    kw.ks &&
      kw.ks.p &&
      kw.ks.p.x &&
      calcFrameStyle(
        arr,
        this.isAeA,
        kw.op,
        kw.ks.p.x,
        ['translateX'],
        1,
        1,
        aeAkey,
      );
    kw.ks &&
      kw.ks.p &&
      kw.ks.p.y &&
      calcFrameStyle(
        arr,
        this.isAeA,
        kw.op,
        kw.ks.p.y,
        ['translateY'],
        1,
        1,
        aeAkey,
      );
    if (aeAkey.animationType === 'pageAnimation') {
      kw.ks &&
        kw.ks.s &&
        calcFrameStyle(
          arr,
          this.isAeA,
          kw.op,
          kw.ks.s.x,
          ['scaleX'],
          1,
          1,
          aeAkey,
        );
      kw.ks &&
        kw.ks.s &&
        calcFrameStyle(
          arr,
          this.isAeA,
          kw.op,
          kw.ks.s.y,
          ['scaleY'],
          1,
          1,
          aeAkey,
        );
      kw.ks &&
        kw.ks.o &&
        calcFrameStyle(
          arr,
          this.isAeA,
          kw.op,
          kw.ks.o,
          ['opacity'],
          1,
          1,
          aeAkey,
        );
      kw.ks &&
        kw.ks.a &&
        calcFrameStyle(
          arr,
          this.isAeA,
          kw.op,
          kw.ks.a,
          ['transformOriginX', 'transformOriginY'],
          1,
          1,
          aeAkey,
        );
    } else {
      kw.ks &&
        kw.ks.s &&
        calcFrameStyle(
          arr,
          this.isAeA,
          kw.op,
          kw.ks.s,
          ['scaleX', 'scaleY'],
          1,
          0.01,
          aeAkey,
        );
      kw.ks &&
        kw.ks.o &&
        calcFrameStyle(
          arr,
          this.isAeA,
          kw.op,
          kw.ks.o,
          ['opacity'],
          1,
          0.01,
          aeAkey,
        );
      kw.ks &&
        kw.ks.a &&
        calcFrameStyle(
          arr,
          this.isAeA,
          kw.op,
          kw.ks.a,
          ['transformOriginX', 'transformOriginY'],
          0,
          1,
          aeAkey,
        );
    }
    arr.forEach((e) => {
      if (e.transformOriginX === undefined) {
        e.transformOriginX = 50;
      }
      if (e.transformOriginY === undefined) {
        e.transformOriginY = 50;
      }
    });
    console.log(arr);
    this.frameStyles[key] = arr;
    this.calcFrameCssStyle(key);
  };

  /**
   * 计算每一帧的最终css样式
   * @param {'i' | 's' | 'o'} key
   */
  calcFrameCssStyle = (key) => {
    const { canvas } = canvasStore.getState().onCanvasPainted;
    const scale =
      (this.props.assetProps && this.props.assetProps.canvasScale) ||
      canvas.scale;
    const {
      aeA = defaultPlaybackRate,
      startTime,
      endTime,
    } = this.props.asset.attribute;

    let lastMatrix;
    // 逆向最后一帧的矩阵
    if (key === 'i') {
      const len = this.frameStyles[key].length;
      const lastFrameStyle = this.frameStyles[key][len - 1];
      lastMatrix = inverse(fromString(getMatrixString(lastFrameStyle, scale)));
    }
    if (key === 'o' && aeA.s.kw) {
      const frames = Math.round(
        (endTime - startTime) / (this.frameInterval * 1000),
      );
      const len = this.frameStyles.s.length;
      const lastFrameStyle = this.frameStyles.s[Math.min(len - 1, frames)];
      lastMatrix = inverse(fromString(getMatrixString(lastFrameStyle, scale)));
    }
    const styles = this.frameStyles[key].map((item) => {
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
        transformOrigin: `${item.transformOriginX}% ${item.transformOriginY}%`,
      };
    });
    this.state.styles[key] = styles;
    this.setState({
      styles: this.state.styles,
    });
  };

  // 执行一便所有动画
  executeAnimationHover = () => {
    const { hoverAnimationKw, className } = this.props.asset.meta;
    for (const i of aeAKeys) {
      if (hoverAnimationKw[i].kw) {
        this.beforeComputeAnimation(
          hoverAnimationKw[i].pbr,
          hoverAnimationKw[i].kw,
          i,
          hoverAnimationKw[i],
        );
      }
    }
    let { styles, frameCount } = this.state;
    const time = Math.round(1000 / styles[hoverAnimationKw.type].length);
    this.executeAnimationTime = setInterval(() => {
      if (frameCount >= styles[hoverAnimationKw.type].length) {
        canvasStore.dispatch(
          paintOnCanvas('CURRENT_TARGET_HOVER_ANIMATION', { execute: 2 }),
        );
        this.setState({
          frameCount: 0,
          hoverStyles: [],
        });
        if (this.executeAnimationTime) {
          clearInterval(this.executeAnimationTime);
        }
        return false;
      }
      this.setState({
        frameCount: ++frameCount,
        hoverStyles: styles[hoverAnimationKw.type][frameCount],
      });
    }, time);
  };

  componentDidUpdate() {
    if (this.isTimeLine || !this.props.asset) {
      return;
    }
    const newKw =
      this.props.asset &&
      this.props.asset.attribute &&
      this.props.asset.attribute.kw;
    const newAeA =
      (this.props.asset &&
        this.props.asset.attribute &&
        this.props.asset.attribute.aeA) ||
      defaultPlaybackRate;
    if (newKw) {
      this.isAeA = false;
    } else if (newAeA) {
      this.isAeA = true;
    }
    if (
      newKw &&
      (!equal(this.oldKw.s.kw, newKw) ||
        this.oldPlaybackRate.s !== newAeA.s.pbr)
    ) {
      this.beforeComputeAnimation(newAeA.s.pbr, newKw, 's', newAeA.s);
    }
    for (const i of aeAKeys) {
      if (
        newAeA[i].resId &&
        (newAeA[i].resId !== this.oldKw[i].resId || !newAeA[i].kw)
      ) {
        this.oldKw[i].resId = newAeA[i].resId;
        if (newAeA[i].animationType !== 'pageAnimation') {
          AeALoader.get(
            newAeA[i].resId,
            this.props.asset.meta.className,
            (data) => {
              canvasStore.dispatch(
                paintOnCanvas('VIDEO_UPDATE_AEAKW', {
                  data,
                  animationKey: i,
                  className: this.props.asset.meta.className,
                }),
              );
            },
          );
        }
      }
      if (
        this.props.asset &&
        (!this.props.asset.meta.executeAnimation ||
          this.props.asset.meta.executeAnimation != 1)
      ) {
        if (
          newAeA[i].kw &&
          (!equal(this.oldKw[i].kw, newAeA[i].kw) ||
            this.oldPlaybackRate[i] !== newAeA[i].pbr)
        ) {
          this.beforeComputeAnimation(
            newAeA[i].pbr,
            newAeA[i].kw,
            i,
            newAeA[i],
          );
          // o 的结果依赖 s 的结果，s 更新, o 也要更新
          if (i === 's' && newAeA.o.kw) {
            this.beforeComputeAnimation(
              newAeA.o.pbr,
              newAeA.o.kw,
              'o',
              newAeA.o,
            );
          }
        }
      }
    }
    if (this.oldKw.s.resId && !newAeA.s.resId && newAeA.o.resId) {
      this.oldKw.s = { resId: '', kw: newAeA.s.kw }; // 让下次 equal(this.oldKw['s'].kw, newAeA['s'].kw) 为 true
      this.rateKw.s = {};
      this.duration.s = 0;
      this.frameStyles.s = [];
      this.state.styles.s = [];
      this.setState({
        styles: this.state.styles,
      });
      this.beforeComputeAnimation(newAeA.o.pbr, newAeA.o.kw, 'o', newAeA.o);
    }
    const { canvas } = canvasStore.getState().onCanvasPainted;
    if (
      this.oldScale !==
      ((this.props.assetProps && this.props.assetProps.canvasScale) ||
        canvas.scale)
    ) {
      this.oldScale =
        (this.props.assetProps && this.props.assetProps.canvasScale) ||
        canvas.scale;
      if (newKw) {
        this.calcFrameCssStyle('s');
      } else {
        for (const i of aeAKeys) {
          newAeA[i].kw && this.calcFrameCssStyle(i);
          if (i === 's' && newAeA.o.kw) {
            this.calcFrameCssStyle('o');
          }
        }
      }
    }
    const startTime =
      this.props.asset &&
      this.props.asset.attribute &&
      this.props.asset.attribute.startTime;
    const endTime =
      this.props.asset &&
      this.props.asset.attribute &&
      this.props.asset.attribute.endTime;
    if (startTime !== this.oldTime.s || endTime !== this.oldTime.e) {
      this.oldTime.s = startTime;
      this.oldTime.e = endTime;
      // 时间变化影响 o 基于 s 的第几帧
      this.calcFrameCssStyle('o');
    }
  }

  /**
   *  控制动图第0帧显示动图样式
   */
  changeLottieShowEmitter() {
    const { lottieShow, lottieShowCs, lottiePreview } = this.state;
    this.changeLottieShowListener = emitter.addListener(
      'changeLottieShow',
      ({ type, preview }) => {
        if (type === 'preview' && preview) {
          this.setState({ lottiePreview: preview });
        } else if (type === 'preview' && !preview) {
          this.setState({ lottiePreview: preview });
        } else {
          this.setState({
            lottieShow: !lottieShow,
            lottieShowCs: lottieShowCs + 1,
            lottiePreview: preview,
          });
        }
      },
    );
  }

  componentWillUnmount() {
    this.changeLottieShowListener && this.changeLottieShowListener.remove();
  }

  render() {
    const { pageInfo, isDesigner } = canvasStore.getState().onCanvasPainted;
    const { lottieShow, lottieShowCs, lottiePreview } = this.state;
    const currentTime =
      this.props.currentTime >= 0
        ? this.props.currentTime
        : pageInfo.currentTime;
    let style = {};
    if (this.props.asset && !this.isTimeLine) {
      const {
        startTime,
        endTime,
        aeA = defaultPlaybackRate,
      } = this.props.asset.attribute;
      let key;
      let currentFrame;
      if (
        this.props.asset.meta.executeAnimation == 1 &&
        this.props.asset.meta.hoverAnimationKw
      ) {
        style = { ...this.state.hoverStyles };
      } else {
        /* s 和 o 的边界处理待定，可能会修改 */
        if (this.props.asset.attribute.kw) {
          key = 's';
          currentFrame = Math.round(
            (currentTime - startTime) / 1000 / this.frameInterval,
          );
        }
        if (
          aeA.i.resId &&
          startTime - this.duration.i <= currentTime &&
          currentTime < startTime
        ) {
          key = 'i';
          if (!isDesigner) {
            if (!lottieShow && lottieShowCs == 0 && !lottiePreview) {
              currentFrame = Math.round(startTime / 1000 / this.frameInterval);
            } else {
              currentFrame = Math.round(
                (currentTime - (startTime - this.duration.i)) /
                  1000 /
                  this.frameInterval,
              );
            }
          } else {
            currentFrame = Math.round(
              (currentTime - (startTime - this.duration.i)) /
                1000 /
                this.frameInterval,
            );
          }
          // currentFrame = Math.round((currentTime - (startTime - this.duration.i)) / 1000 / this.frameInterval);
        } else if (
          aeA.s.resId &&
          startTime <= currentTime &&
          currentTime < endTime
        ) {
          key = 's';
          currentFrame = Math.round(
            (currentTime - startTime) / 1000 / this.frameInterval,
          );
        } else if (aeA.o.resId && endTime <= currentTime) {
          key = 'o';
          currentFrame = Math.round(
            (currentTime - endTime) / 1000 / this.frameInterval,
          );
        }
        const kw = key && this.rateKw[key];
        if (
          kw &&
          kw.op >= 0 &&
          kw.ip >= 0 &&
          this.state.styles[key].length > 0
        ) {
          if (currentFrame >= kw.op) {
            style = { ...this.state.styles[key][kw.op] };
          } else {
            if (currentFrame >= kw.ip) {
              style = { ...this.state.styles[key][currentFrame] };
            }
          }
        }
      }
    }
    style.position = this.props.assetStyle.position;
    style.left = this.props.assetStyle.left;
    style.top = this.props.assetStyle.top;
    style.zIndex = this.props.assetStyle.zIndex;
    style.visibility = this.props.assetStyle.visibility;
    if (this.props.assetStyle.pointerEvents) {
      style.pointerEvents = this.props.assetStyle.pointerEvents;
    }

    // 用于标记包裹在哪个元素外层 来获取 transform 矩阵 或是 classNameString 修改 鼠标穿透
    const className =
      this.props.classNameString ||
      (this.props.asset
        ? `custom-animation-${this.props.asset.meta.className}`
        : '');

    return (
      <div className={className} style={style}>
        {this.props.children}
      </div>
    );
  }
}
