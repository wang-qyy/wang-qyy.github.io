import lottie, { AnimationItem } from 'lottie-web';
import { RGBAToString } from '@kernel/utils/single';
import type { Asset, AssetClass, CanvasInfo, RGBA } from '@kernel/typing';
import {
  editingKeyList,
  navigationKeyCodeList,
  optionKeyCodeList,
} from '@kernel/utils/defaultConfig';
import { config } from '@kernel/utils/config';
import React, { CSSProperties, useMemo } from 'react';
import { getLottieSync } from '@kernel/store';
import { setColorById, setColorsByJSON } from '@/kernel/utils/lottieColorify';
import { isLottieType } from '@/kernel/utils/assetChecker';
import { OldLottieHandler } from './oldUtils';

const disabledKey = [...editingKeyList, ...navigationKeyCodeList];

export function useLottieStyle(
  asset: AssetClass,
  canvasInfo: CanvasInfo,
  showOnly: boolean,
  lottieIsEditing = false,
  lottieWidth: number,
  prefix: string,
) {
  const { scale } = canvasInfo;
  const { isTextEditor = false, isImageEditor = false } = asset.meta ?? {};
  const { horizontalFlip, verticalFlip } = asset.transform;
  const { textEditor, width, height } = asset.attribute;

  const lottieId = useMemo(() => {
    return `${prefix}-lottie-${showOnly ? '-showOnly' : ''}-${asset.id}`;
  }, [prefix, showOnly, asset.id]);

  const canEdit = (isTextEditor || isImageEditor) && !showOnly;

  const lottieStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    transform: `scaleX(${horizontalFlip ? -1 : 1}) scaleY(${
      verticalFlip ? -1 : 1
    })`,
    visibility: lottieIsEditing ? 'hidden' : 'visible',
  };

  let containerStyle: CSSProperties = {};
  let editablePanelStyle: CSSProperties = {};
  let editPanelShowStyle: CSSProperties = {};
  let editPanelShowText = '';

  if (canEdit) {
    // @ts-ignore
    const curTextEditor = textEditor[0];
    const dataFontFamily = curTextEditor.fontFamily;
    const dataFontSize = curTextEditor.fontSize;
    const dataColor = curTextEditor.color;
    const dataText = curTextEditor.text[0];

    const newfontFamily = config.getFontFamily(dataFontFamily);
    const newfontFamily2 = config.getFontFamily('fnsyhtRegular');

    const _fontFamilyStr = `${newfontFamily},${newfontFamily2}`;
    const _colorStr = RGBAToString(dataColor);

    containerStyle = {
      height: '100%',
      position: 'relative',
    };

    let editableFontSize = dataFontSize * scale;
    if (lottieWidth && lottieWidth > 0) {
      editableFontSize *= (width * scale) / lottieWidth;
    }
    editablePanelStyle = {
      visibility: lottieIsEditing ? 'visible' : 'hidden',
      position: 'absolute',
      top: '50%',
      transform: `translateY(-50%)`,
      width: '100%',
      height: 'auto',
      cursor: 'default',
      color: _colorStr,
      fontFamily: _fontFamilyStr,
      fontSize: `${editableFontSize}px`,
      whiteSpace: 'nowrap',
    };

    editPanelShowStyle = {
      width: 'auto',
      height: 'auto',
      color: _colorStr,
      fontFamily: _fontFamilyStr,
      fontSize: `${editableFontSize}px`,
      visibility: 'hidden',
      whiteSpace: 'nowrap',
    };
    editPanelShowText = dataText;
  }
  return {
    editPanelShowText,
    containerStyle,
    editablePanelStyle,
    lottieStyle,
    editPanelShowStyle,
    lottieId,
    canEdit,
  };
}

export function useEditLottieEvent(
  ref: HTMLDivElement | unknown,
  setTextEditor: (text: string) => void,
) {
  function blurEditableLottie(e: React.FocusEvent<HTMLDivElement>) {
    const { innerText } = e.target;
    setTextEditor(innerText);
  }

  function keyUpEditLottie(e: React.KeyboardEvent<HTMLDivElement>) {
    // @ts-ignore
    const { innerText } = e.target;
    setTextEditor(innerText);
  }

  function mouseDownEditLottie(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  function keyDownEditLottie(e: React.KeyboardEvent<HTMLDivElement>) {
    const keycode = e.code;
    if (
      disabledKey.includes(keycode) ||
      ((e.ctrlKey || e.metaKey) && optionKeyCodeList.includes(keycode))
    ) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }
  }

  return {
    blurEditableLottie,
    keyUpEditLottie,
    mouseDownEditLottie,
    keyDownEditLottie,
  };
}

export type OnDomLoaded = (data: {
  lottieWidth: number;
  lottieHeight: number;
  lt_WtoH_ratio: number;
  lottieLayers: any;
}) => void;

export class LottieHandler {
  lottieDom: HTMLDivElement;

  OldLottieHandler?: OldLottieHandler;

  lottieId: string;

  lottieW_H_ratio: number;

  onDomLoaded: OnDomLoaded;

  animation?: AnimationItem;

  constructor(lottieId: string, onDomLoaded: OnDomLoaded) {
    this.lottieDom = document.getElementById(lottieId) as HTMLDivElement;
    this.lottieId = lottieId;
    this.onDomLoaded = onDomLoaded;
    this.lottieW_H_ratio = 1;
  }

  getAnimationData = () => {
    // @ts-ignore
    const animationData = this.animation?.animationData ?? {};
    const lottieWidth = animationData.w ?? 0;
    const lottieHeight = animationData.h ?? 0;
    const lottieLayers = animationData.layers ?? [];
    const lt_WtoH_ratio = lottieWidth / lottieHeight;
    return {
      lottieWidth,
      lottieHeight,
      lottieLayers,
      lt_WtoH_ratio,
    };
  };

  addDOMLoadedListener = () => {
    this.animation?.addEventListener('DOMLoaded', () => {
      const { lottieWidth, lottieHeight, lottieLayers, lt_WtoH_ratio } =
        this.getAnimationData();

      if (this.lottieW_H_ratio != lt_WtoH_ratio) {
        this.lottieW_H_ratio = lt_WtoH_ratio;
      }
      this.OldLottieHandler = new OldLottieHandler(
        this.lottieDom,
        this.animation,
      );
      this.onDomLoaded({
        lottieWidth,
        lottieHeight,
        lt_WtoH_ratio,
        lottieLayers,
      });
    });
  };

  init = (
    path: string,
    loop: boolean,
    resId: number | string,
    isTranstion: boolean,
    asset: AssetClass,
  ) => {
    let color: Record<string, RGBA> | undefined;
    let lottieData = getLottieSync(path);
    if (isTranstion && lottieData && asset) {
      const { data, colors } = setColorsByJSON({
        animationData: lottieData,
        colors: asset.attribute.colors,
      });
      lottieData = data;
      asset.setSVGColors(colors);
    }

    this.animation = lottie.loadAnimation({
      container: this.lottieDom,
      animationData: lottieData, // Required
      renderer: 'svg', // Required
      loop, // Optional//  init_state - 1 | 2   2-循环
      autoplay: false, // Optional
      name: `${this.lottieId}`, // Name for future reference. Optional.
    });
    // 判断是否是转场
    if (asset.meta.isTransfer) {
      // 设置速度
      this.animation.setSpeed(
        asset.attribute.rt_total_time / asset.attribute.totalTime,
      );
    }
    this.addDOMLoadedListener();
    this.lottieDom.setAttribute('lottie-res-id', `${resId}`);

    return color;
  };

  /**
   * 更新播放速度
   * @param asset
   */
  updateSpeed(asset: AssetClass) {
    // 判断是否是转场
    if (asset.meta.isTransfer && this.animation) {
      // 设置速度
      this.animation.setSpeed(
        asset.attribute.rt_total_time / asset.attribute.totalTime,
      );
    }
  }

  /**
   *
   * @param frameTime 当前帧数
   * @param frameRate 速率比例
   * @param playSpeed 播放速度
   * @param totalFrames 总帧数
   * @param isLoop 总帧数
   */
  static getCurrentFrame = (
    frameTime: number,
    frameRate: number,
    playSpeed: number,
    totalFrames: number,
    isLoop: boolean,
  ) => {
    const frame = Math.floor((frameTime / 16.7) * (frameRate / 60) * playSpeed);
    if (!isLoop && frame > totalFrames) {
      return frame;
    }
    /*
        frameTime / 16.7  超出了多少帧
        frameRate / 60    当前动画速率比例
        *playSpeed  比例再乘以原本动画速度
        % (totalFrames + 1) 取余获取当前动画的帧数
    */
    return Math.floor(frame % (totalFrames + 1));
  };

  play = (frameTime: number, isLoop = false) => {
    const {
      totalFrames = 1,
      frameRate = 1,
      playSpeed = 1,
    } = this.animation || {};

    const lottieFrame = LottieHandler.getCurrentFrame(
      frameTime,
      frameRate,
      playSpeed,
      totalFrames,
      isLoop,
    );

    this.animation?.goToAndStop(lottieFrame < 0 ? 0 : lottieFrame, true);
    return {
      totalFrames,
      lottieFrame,
    };
  };

  destroy = () => {
    if (this.animation) {
      this.animation.destroy();
      this.lottieDom.innerText = '';
    }
  };

  replace = (
    path: string,
    loop: boolean,
    resId: number,
    isTranstion = false,
    asset: AssetClass,
  ) => {
    this.destroy();
    setTimeout(() => {
      this.init(path, loop, resId, isTranstion, asset);
    });
  };

  /**
   * 更新lottie颜色
   */
  updateColor = (colors: Record<string, RGBA>, lottieId: string) => {
    colors && setColorById(colors, lottieId);
  };
}
