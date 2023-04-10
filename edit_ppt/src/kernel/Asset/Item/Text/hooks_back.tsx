import React, {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AeA,
  AssetClass,
  AssetItemProps,
  CanvasInfo,
  VideoStatus,
} from '@kernel/typing';

import { useCreation } from 'ahooks';

import { getTextEditAsset } from '@kernel/store';
import { getFontStyle } from '@kernel/utils/assetHelper/font';
import {
  AeaHandler,
  AnimationHandler,
  calcTextAniDuration,
  TextDomHandler,
} from '@AssetCore/Item/Text/textHelper';

import { getAssetAea } from '@kernel/utils/StandardizedTools';
import {
  AeAItem,
  AeaItemKey,
} from '@AssetCore/Item/Text/textHelper/aeaAnimation/typing';
import { VideoTimerByRAF } from '@kernel/Canvas/VideoTimer/utils';
import { PlayStatus } from '@kernel/utils/const';
import { aeAKey } from '@AssetCore/Item/Text/textHelper/aeaAnimation/const';
import type { Refs, TextPositionObject } from './components/originText/typing';

/**
 * @description 获取字体body样式
 * @param asset
 */
export function useStyle(asset: AssetClass) {
  const textEditAsset = getTextEditAsset();

  function needHidden(hidden?: boolean): CSSProperties {
    return hidden || textEditAsset === asset
      ? {
          opacity: 0,
        }
      : {};
  }

  return {
    fontStyle: getFontStyle(asset),
    needHidden,
  };
}

/**
 * @description 构建渲染使用的字体
 * @param asset
 * @param canvasInfo
 */
export function useText(asset: AssetClass, canvasInfo: CanvasInfo) {
  const handler = useCreation<TextDomHandler>(() => new TextDomHandler(), []);
  const [textPosition, setTextPosition] = useState<TextPositionObject>({});
  const { attribute } = asset;
  const {
    text = [],
    writingMode,
    fontSize,
    letterSpacing,
    textAlign,
    width,
    height,
  } = attribute;

  const data = useMemo(() => {
    handler.updateText(text);
    return {
      textInstance: handler.textInstance,
      textHtml: handler.textHtml,
      renderText: handler.renderText,
      textLength: handler.textNumber,
      textRefs: handler.textRefs,
    };
  }, [text]);

  useLayoutEffect(() => {
    if (setTextPosition) {
      setTimeout(() => {
        handler.updateTextPosition();
        setTextPosition(handler.textPosition);
      }, 50);
    }
  }, [text, writingMode, fontSize, letterSpacing, textAlign, width, height]);

  return {
    ...data,
    textPosition,
    textHandler: handler,
  };
}

/**
 * @description 构建字体动画所需要的数据
 * @param videoInfo
 * @param asset
 * @param canvasInfo
 * @param writeHandImgRef
 * @param textHandler
 */
export function useAnimationData(
  {
    videoInfo,
    videoStatus,
    asset,
    canvasInfo,
    isAssetActive,
    isPreviewMovie,
    showOnly,
  }: AssetItemProps,
  textHandler: TextDomHandler,
) {
  const { rt_previewAeA } = asset.attribute;

  const [mockTime, setMockTime] = useState(0);

  const timeHandler = useCreation<VideoTimerByRAF>(
    () =>
      new VideoTimerByRAF((number) => {
        setMockTime(Math.max(number, 0));
      }),
    [],
  );
  const aeaKwInfoRef = useRef<typeof aeaKwInfo>();
  const aeaKwInfo = useMemo(() => {
    if (!rt_previewAeA || showOnly) {
      aeaKwInfoRef.current = undefined;
      return;
    }
    for (let i = 0; i < aeAKey.length; i++) {
      const target = rt_previewAeA[aeAKey[i]];
      if (target.resId && target.kw && target.kw.isText) {
        const result = {
          resId: target.resId,
          pbr: target.pbr,
          isText: target.kw.isText,
          textDelay: target.kw.textDelay,
          key: aeAKey[i],
        };
        aeaKwInfoRef.current = result;
        return result;
      }
    }
  }, [rt_previewAeA]);

  function getAnimationParams(): AnimationParams {
    const { attribute, animationItemPbr } = asset;
    const { text = [] } = attribute;
    const { currentTime } = videoStatus;
    const { allAnimationTime } = videoInfo;
    const {
      startTime = videoInfo.startTime ?? 0,
      endTime = videoInfo.endTime ?? 10000,
      animation,
    } = attribute;
    const speed = 200 / animationItemPbr.i; // 速度 5 字 / s ,
    const aHeadAnimationTime = 500 / animationItemPbr.i; // 前置动画时间
    return {
      animationItemPbr,
      text,
      isAssetActive,
      isPreviewMovie,
      canvas: canvasInfo,
      allAnimationTime,
      currentTime: aeaKwInfoRef.current ? timeHandler.currentTime : currentTime,
      aeaPreview: !!aeaKwInfoRef.current,
      speed,
      aHeadAnimationTime,
      startTime,
      endTime,
      showOnly,
      asset,
      textLength: textHandler.textNumber,
      textPosition: textHandler.textPosition,
      textRefs: textHandler.textRefs,
      assetShowTime: endTime - startTime + aHeadAnimationTime,
      enterTypeId: Number(animation?.enter.baseId ?? 0),
      exitTypeId: Number(animation?.exit.baseId ?? 0),
    };
  }

  useEffect(() => {
    if (showOnly) {
      return;
    }

    if (
      aeaKwInfo &&
      aeaKwInfo.isText &&
      videoStatus.playStatus !== PlayStatus.Playing
    ) {
      const { key } = aeaKwInfo;
      const { inDuration, outDuration } = calcTextAniDuration(asset, aeaKwInfo);
      const duration = key === 'i' ? inDuration : outDuration * 2;
      if (timeHandler.playStatus !== PlayStatus.Playing) {
        timeHandler.play(0);
      }
      if (mockTime > duration) {
        timeHandler.stop();
        asset.deletePreviewAEAKw && asset.deletePreviewAEAKw();
        setMockTime(0);
      }
    } else {
      timeHandler.stop();
      if (aeaKwInfo?.isText) {
        asset.deletePreviewAEAKw && asset.deletePreviewAEAKw();
      }
      setMockTime(0);
      aeaKwInfoRef.current = undefined;
    }
  }, [rt_previewAeA, mockTime, videoStatus]);

  return {
    getAnimationParams,
    aeaPreview: aeaKwInfo,
    mockTime,
  };
}

export interface AnimationParams {
  animationItemPbr: Record<keyof AeA, number>;
  text: string[];
  isAssetActive: boolean;
  isPreviewMovie?: boolean;
  aeaPreview: boolean;
  showOnly: boolean;
  canvas: CanvasInfo;
  allAnimationTime: number;
  currentTime: number;
  speed: number;
  aHeadAnimationTime: number;
  startTime: number;
  endTime: number;
  asset: AssetClass;
  textLength: number;
  textPosition: TextPositionObject;
  textRefs: Refs;
  assetShowTime: number;
  enterTypeId: number;
  exitTypeId: number;
}

/**
 * @description 字体动画处理逻辑
 * @param asset
 * @param getAnimationParams
 * @param writeHandImgRef 手的动画图片
 */
export function useAnimation(
  asset: AssetClass,
  getAnimationParams: () => AnimationParams,
  writeHandImgRef: React.RefObject<HTMLImageElement>,
) {
  const { attribute } = asset;
  const newAea = getAssetAea(attribute);
  const { i: aeAI, o: aeAO, s: aeAS } = newAea;
  const handler = useCreation(() => {
    if (asset.isAea) {
      return new AeaHandler(asset, getAnimationParams);
    }
    return new AnimationHandler(writeHandImgRef, getAnimationParams);
  }, [asset.isAea]);

  function updaterKey(key: AeaItemKey, aeaItem: AeAItem) {
    const formatAea = { ...aeaItem };
    // 给动画播放的pbr增加限制，使动画看起来更协调
    (handler as AeaHandler).handler.updateItem(key, formatAea);
    (handler as AeaHandler).handler.buildFreshStyle(key);
  }
  useEffect(() => {
    if (asset.isAea && handler) {
      (handler as AeaHandler).setPreviewHandler?.();
    }
  }, [attribute.rt_previewAeA]);

  useEffect(() => {
    if (asset.isAea && aeAI?.kw?.isText) {
      updaterKey('i', aeAI as AeAItem);
    }
  }, [aeAI?.kw, aeAI?.pbr]);

  useEffect(() => {
    if (asset.isAea && aeAS?.kw?.isText) {
      updaterKey('s', aeAS as AeAItem);
    }
  }, [aeAS?.kw, aeAS?.pbr]);

  useEffect(() => {
    if (asset.isAea && aeAO?.kw?.isText) {
      updaterKey('o', aeAO as AeAItem);
    }
  }, [aeAO?.kw, aeAO?.pbr]);

  function getAnimationStatus() {
    const {
      aHeadAnimationTime,
      enterTypeId,
      startTime,
      currentTime,
      showOnly,
      aeaPreview,
    } = getAnimationParams();
    if (asset.isAea) {
      const status = {
        isTextAnimationIng: false,
        showWriteTextImg: false,
        isWriteTextImgOut: false,
        enterTypeId: -1,
        aeaPreview,
      };
      const { assetDuration, attribute } = asset;
      /**
       *  由于字体动画的执行逻辑与普通动画不同，需要占用驻场时间。
       *  所以入场动画的时间 实际入场时间+元素最小驻场时间100ms。也就是endTime-100
       */
      if (
        currentTime >= assetDuration.startTime &&
        currentTime < attribute.endTime - 100
      ) {
        status.isTextAnimationIng = true;
      }
      if (
        currentTime >= attribute.endTime &&
        currentTime <= assetDuration.endTime
      ) {
        status.isTextAnimationIng = true;
      }
      return status;
    }
    const AnimationInEndTime = (
      handler as AnimationHandler
    ).calcTextAnimationInEndTime();
    let isTextAnimationIng = false;
    let showWriteTextImg = false;
    let isWriteTextImgOut = false;
    const textAniBaseId = enterTypeId;
    // 新增的入场动画 动画结束时间
    const addTextAniInEndTime = AnimationInEndTime?.aniInEndTime;
    const time = aHeadAnimationTime; // 写字动画只受 aea.i.pbr 影响;

    if (
      textAniBaseId >= 5 &&
      currentTime >= startTime - time &&
      currentTime < addTextAniInEndTime &&
      !showOnly
    ) {
      // 新添加的文字动画
      isTextAnimationIng = true;
    }

    if (
      textAniBaseId === 5 &&
      currentTime >= startTime - 2 * time &&
      currentTime < addTextAniInEndTime + time &&
      !showOnly
    ) {
      showWriteTextImg = true;
      if (currentTime >= addTextAniInEndTime) {
        isWriteTextImgOut = true;
      }
    }

    return {
      isTextAnimationIng,
      showWriteTextImg,
      isWriteTextImgOut,
      enterTypeId,
      aeaPreview,
    };
  }

  return {
    renderTextByPosition: handler.renderTextByPosition,
    getAnimationStatus,
  };
}

export function useAnimationStatus(
  animationParams: AnimationParams,
  showOnly: boolean,
  videoStatus: VideoStatus,
  isAssetActive: boolean,
) {
  const { currentTime, playStatus } = videoStatus;

  /**
   * @description 计算 新增 入场动画 的 结束时间
   */
  function calcTextAnimationInEndTime() {
    const {
      speed,
      aHeadAnimationTime,
      startTime,
      endTime,
      textLength,
      assetShowTime,
      enterTypeId,
      allAnimationTime,
      textPosition,
      currentTime,
      exitTypeId,
    } = animationParams;

    let aniInEndTime = startTime;
    let allAniTime = 0;
    let textAniShowTime = assetShowTime;

    if (enterTypeId > 0) {
      textAniShowTime -= aHeadAnimationTime;
    }
    if ([5, 9, 7, 8].includes(enterTypeId)) {
      // 除了逐行显示
      const allTime =
        textLength * speed > textAniShowTime
          ? textAniShowTime
          : textLength * speed;

      const aniNeedTime = allTime + startTime - aHeadAnimationTime;

      allAniTime = aniNeedTime; // 总共动画所需时间
      aniInEndTime = aniNeedTime <= endTime ? aniNeedTime : endTime; // 动画结束的时间点
    }
    if (enterTypeId === 6) {
      let allTextRows = 1;
      let maxTop = 0;

      Object.keys(textPosition).forEach((key) => {
        const item = textPosition[key];
        if (item.top > maxTop) {
          allTextRows += 1;
          maxTop = item.top;
        }
      });

      const _speed = 333;
      const allAningTime =
        allTextRows * _speed > textAniShowTime
          ? textAniShowTime
          : allTextRows * _speed;

      const aniNeedTime = allAningTime + startTime - aHeadAnimationTime;

      allAniTime = aniNeedTime; // 总共动画所需时间
      aniInEndTime = aniNeedTime <= endTime ? aniNeedTime : endTime; // 动画结束的时间点
    }
    return { aniInEndTime, allAniTime }; // 计算出 动画的结束时间点 以及 动画所需的总共时间
  }

  const AnimationInEndTime = useCreation<
    ReturnType<typeof calcTextAnimationInEndTime>
  >(() => calcTextAnimationInEndTime(), [animationParams]);

  const { isTextAnimationIng, showWriteTextImg, isWriteTextImgOut } =
    useMemo(() => {
      const { aHeadAnimationTime, enterTypeId, startTime, aeaPreview } =
        animationParams;

      let isTextAnimationIng = false;
      let showWriteTextImg = false;
      let isWriteTextImgOut = false;
      const textAniBaseId = enterTypeId;
      const textLayerMaxIndex = 0;
      // 新增的入场动画 动画结束时间
      const addTextAniInEndTime = AnimationInEndTime?.aniInEndTime;
      const time = aHeadAnimationTime; // 写字动画只受 aea.i.pbr 影响;

      if (
        textAniBaseId >= 5 &&
        currentTime >= startTime - time &&
        currentTime < addTextAniInEndTime &&
        !showOnly
      ) {
        // 新添加的文字动画
        isTextAnimationIng = true;
      }

      if (
        textAniBaseId === 5 &&
        currentTime >= startTime - 2 * time &&
        currentTime < addTextAniInEndTime + time &&
        !showOnly
      ) {
        showWriteTextImg = true;
        if (currentTime >= addTextAniInEndTime) {
          isWriteTextImgOut = true;
        }
      }

      // if (isAssetActive || playStatus !== PlayStatus.Playing) {
      //   isTextAnimationIng = false;
      //   showWriteTextImg = false;
      //   isWriteTextImgOut = false;
      // }

      return {
        isTextAnimationIng,
        showWriteTextImg,
        isWriteTextImgOut,
      };
    }, [currentTime, playStatus, isAssetActive, AnimationInEndTime]);

  return {
    isTextAnimationIng,
    showWriteTextImg,
    isWriteTextImgOut,
  };
}

/**
 * @description 由于字体的宽高由其本身字体性质决定，所以在初始化字体后，自动纠正字体尺寸
 * @param asset
 * @param isPreviewMovie
 */
export function useUpdateTextSizeWhenInit(
  asset: AssetClass,
  isPreviewMovie: boolean,
) {
  const effectFont = useRef<HTMLDivElement>(null);
  const normalFont = useRef<HTMLDivElement>(null);
  const { attribute } = asset;
  const {
    writingMode,
    fontFamily,
    lineHeight,
    text,
    letterSpacing,
    fontSize,
    effect,
    width,
    height,
  } = attribute;
  const textEditAsset = getTextEditAsset();

  function updateFontSize() {
    // 成组的文字 不需要自动校正宽高
    if (asset.parent) {
      return;
    }
    if (normalFont.current) {
      const { writingMode, width, height } = asset.attribute;
      const { fontSizeScale } = asset;
      let { offsetHeight, offsetWidth } = normalFont.current;
      offsetHeight *= fontSizeScale;
      offsetWidth *= fontSizeScale;
      // 向上取整
      offsetHeight = Math.ceil(offsetHeight);
      offsetWidth = Math.ceil(offsetWidth);
      if (writingMode === 'vertical-rl') {
        if (width !== offsetWidth) {
          asset.update({
            attribute: {
              width: Math.max(offsetWidth, 12),
            },
          });
        }
      } else {
        if (height !== offsetHeight) {
          asset.update({
            attribute: {
              height: Math.max(offsetHeight, 12),
            },
          });
        }
      }
    }
  }

  useLayoutEffect(() => {
    if (isPreviewMovie) {
      return;
    }
    // 当字体处于编辑状态时，不需要自动矫正字体宽高
    if (textEditAsset !== asset && !asset?.tempData?.rt_stopAutoCalc) {
      updateFontSize();
    }
  }, [writingMode, fontFamily, lineHeight, letterSpacing, effect]);

  useLayoutEffect(() => {
    if (isPreviewMovie) {
      return;
    }
    // 由于字体的特殊性，所以在响应字体模式下，只修改对应尺寸，令一边尺寸，由字体自适应调整
    if (
      textEditAsset !== asset &&
      normalFont.current &&
      !attribute?.rt_stopAutoCalc
    ) {
      updateFontSize();
    }
  }, [width, height, fontSize, text, textEditAsset]);
  return {
    effectFont,
    normalFont,
  };
}
