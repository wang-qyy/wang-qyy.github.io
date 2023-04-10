import { CSSProperties } from 'react';
import { aeAKey, aeaKey, defaultStyle } from './const';
import { AeA, AeAItem, AeaItemKey, AeAKw, AnimationInfo } from './typing';
import {
  getPlaybackRateKW,
  getDuration,
  computeAnimation,
  calcFrameCssStyle,
  cloneKw,
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

  pbr = 0;

  constructor(aeAItem: AeAItem) {
    this.kw = aeAItem.kw;
    this.updatePbr(aeAItem.pbr);
  }

  buildNewKwByPbr = (pbr: number) => {
    this.rateKw = getPlaybackRateKW(pbr, this.kw) as AeAKw;
    this.duration = getDuration(this.rateKw);
    this.frameStyles = computeAnimation(this.rateKw);
  };

  updatePbr = (pbr: number) => {
    if (this.pbr !== pbr) {
      this.pbr = pbr;
      this.buildNewKwByPbr(pbr);
    }
  };
}

export default class Animation {
  _handlers: Partial<AeaHandler>;

  styles: {
    i: CSSProperties[];
    s: CSSProperties[];
    o: CSSProperties[];
  } = {
    i: [],
    s: [],
    o: [],
  };

  animationInfo: AnimationInfo;

  constructor(animationInfo: AnimationInfo, aea: Partial<AeA>) {
    this.animationInfo = animationInfo;
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
      return new AnimationHandler(aeAItem);
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
      this.buildFreshStyle(key);
    }
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
