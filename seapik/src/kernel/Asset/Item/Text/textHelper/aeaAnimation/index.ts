import { CSSProperties } from 'react';
import { toJS } from 'mobx';
import { aeAKey, aeaKey, defaultStyle } from './const';
import { AeA, AeAItem, AeaItemKey, AeAKw, AnimationInfo } from './typing';
import {
  getPlaybackRateKW,
  getDuration,
  computeAnimation,
  calcFrameCssStyle,
} from './helper';

export interface AeaHandler {
  i: AnimationHandler;
  s: AnimationHandler;
  o: AnimationHandler;
}

class AnimationHandler {
  // 每一帧的transform 变换数据
  styles: CSSProperties[] = [];

  // 每一帧的css样式
  frameStyles: Array<typeof defaultStyle> = [];

  // 变速后的动画数据
  rateKw!: AeAKw;

  // 原始数据
  kw: AeAKw;

  duration = 0;

  basePbr = 1;

  pbr = 1;

  constructor(aeAItem: AeAItem, FPS: number) {
    this.kw = aeAItem.kw;
    this.calcBasePbrByFPS(FPS);
    this.updatePbr(aeAItem.pbr);
    this.buildNewKwByPbr();
  }

  calcBasePbrByFPS = (FPS: number) => {
    const totalFrames = this.kw.op - this.kw.ip;
    this.basePbr = totalFrames / FPS;
  };

  buildNewKwByPbr = () => {
    this.rateKw = getPlaybackRateKW(this.basePbr * this.pbr, this.kw) as AeAKw;
    this.duration = getDuration(this.rateKw);
    this.frameStyles = computeAnimation(this.rateKw);
  };

  updatePbr = (pbr: number) => {
    if (this.pbr !== pbr) {
      this.pbr = pbr;
    }
  };
}

export default class AeaAnimation {
  _handlers: Partial<AeaHandler>;

  FPS: number;

  styles: {
    i: {
      opacity: number;
      transform: CSSProperties['transform'];
    }[];
    s: {
      opacity: number;
      transform: CSSProperties['transform'];
    }[];
    o: {
      opacity: number;
      transform: CSSProperties['transform'];
    }[];
  } = {
    i: [],
    s: [],
    o: [],
  };

  animationInfo: AnimationInfo;

  constructor(animationInfo: AnimationInfo, aea: Partial<AeA>, FPS = 30) {
    this.animationInfo = animationInfo;
    this.FPS = FPS;
    this._handlers = {
      i: this._handlerCreator(aeaKey.i, aea.i),
      s: this._handlerCreator(aeaKey.s, aea.s),
      o: this._handlerCreator(aeaKey.o, aea.o),
    };
    aeAKey.forEach(key => {
      this.buildFreshStyle(key);
    });
  }

  /**
   * @description 创建handler
   * @param key
   * @param aeAItem
   */
  _handlerCreator = (key: AeaItemKey, aeAItem?: AeAItem) => {
    if (aeAItem?.kw) {
      return new AnimationHandler(aeAItem, this.FPS);
    }
  };

  /**
   * @description 更新子动画的pbr（倍速）
   * @param key
   * @param pbr
   */
  updateItemPbr = (key: AeaItemKey, pbr: number) => {
    const handler = this._handlers[key];
    if (handler) {
      handler.updatePbr(pbr);
      handler.buildNewKwByPbr();
      this.buildFreshStyle(key);
    }
  };

  /**
   * @description 更新子动画的pbr（倍速）
   * @param key
   * @param aeaItem
   */
  updateItem = (key: AeaItemKey, aeaItem: AeAItem) => {
    this._handlers[key] = this._handlerCreator(key, aeaItem);
  };

  /**
   * @description 更新动画属性，scale和持续时间发生变化都需要重新计算
   * @param animationInfo
   */
  updateIAnimationInfo = (animationInfo: AnimationInfo) => {
    this.animationInfo = animationInfo;
    aeAKey.forEach(key => {
      this.buildFreshStyle(key);
    });
  };

  buildFreshStyle = (key: AeaItemKey) => {
    const frameStyles = {
      i: this._handlers.i?.frameStyles || [],
      s: this._handlers.s?.frameStyles || [],
      o: this._handlers.o?.frameStyles || [],
    };

    this.styles[key] =
      calcFrameCssStyle(key, frameStyles, this.animationInfo) || [];
  };
}
