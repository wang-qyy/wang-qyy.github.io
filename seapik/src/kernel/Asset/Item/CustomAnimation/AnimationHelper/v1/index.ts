import { config } from '@kernel/utils/config';
import { useCreation, useSetState, useUpdateEffect } from 'ahooks';
import {
  Asset,
  AeA,
  AeAKw,
  AssetItemProps,
  CanvasInfo,
  AssetClass,
} from '@kernel/typing';
import { PlayStatus } from '@kernel/utils/const';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { getAssetAea } from '@kernel/utils/StandardizedTools';
import {
  getPlaybackRateKW,
  getDuration,
  calcFrameCssStyle,
  calcFrameStyle,
  defaultStyle,
  aeAKeys,
  aeaKey,
} from './tools';

const aeaKeyMap = aeaKey as Record<keyof AeA, keyof AeA>;

/**
 * @description 计算当前时间节点的帧画面
 * @param time
 */
export function getCurrentFrame(time: number) {
  return Math.round(time / 1000 / config.frameInterval);
}

export function useAnimationStore() {
  const [updater, setUpdater] = useState(0);
  const [styles, setStyles] = useSetState<Record<keyof AeA, CSSProperties[]>>({
    i: [],
    s: [],
    o: [],
  });
  const rateKw = useCreation<Record<keyof AeA, AeAKw | null>>(
    () => ({
      i: null,
      s: null,
      o: null,
    }),
    [updater],
  );
  const duration = useCreation(
    () => ({
      i: 0,
      s: 0,
      o: 0,
    }),
    [updater],
  );
  const frameStyles = useCreation<
    Record<keyof AeA, Array<typeof defaultStyle>>
  >(
    () => ({
      i: [],
      s: [],
      o: [],
    }),
    [updater],
  );

  function resetStore() {
    setUpdater(val => val + 1);
    setStyles({
      i: [],
      s: [],
      o: [],
    });
  }

  return {
    frameStyles,
    duration,
    rateKw,
    styles,
    setStyles,
    resetStore,
  };
}

export function useAnimation(asset: AssetClass, canvasInfo: CanvasInfo) {
  const { attribute } = asset;
  const { frameStyles, duration, rateKw, styles, setStyles, resetStore } =
    useAnimationStore();

  const isAea = useMemo(() => {
    return !attribute.kw;
  }, [attribute.kw, attribute.aeA]);

  const {
    aeA = config.getDefaultPlaybackRate(),
    startTime,
    endTime,
    kw,
  } = attribute;

  // matrix(1, 0, 0, 1, -60.6611, 8.85431)
  /**
   * 计算每一帧的最终css样式
   * @param {'i' | 's' | 'o'} kwKey
   */
  function runCalcFrameCssStyle(kwKey: keyof AeA) {
    return calcFrameCssStyle(kwKey, frameStyles, {
      aeA,
      scale: canvasInfo.scale,
      startTime,
      endTime,
    });
  }

  function computeAnimation(kw: AeAKw) {
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

  function setCurrentKw(kwKey: keyof AeA) {
    const value = runCalcFrameCssStyle(kwKey);
    if (value) {
      setStyles({
        [kwKey]: value,
      });
    }
  }

  /**
   * @description 当kw数据发生变化时，更新当前动画数据
   * @param pbr
   * @param kw
   * @param kwKey
   */
  function onKwChange(pbr: number, kw: AeAKw, kwKey: keyof AeA) {
    rateKw[kwKey] = getPlaybackRateKW(pbr, kw) as AeAKw;
    duration[kwKey] = getDuration(rateKw[kwKey]);
    frameStyles[kwKey] = computeAnimation(rateKw[kwKey] as AeAKw);
    setCurrentKw(kwKey);
  }

  useUpdateEffect(() => {
    if (kw) {
      setCurrentKw('s');
    } else {
      for (const i of aeAKeys) {
        const key = i as keyof AeA;
        if (aeA[key].kw) {
          setCurrentKw(key);
        }
        if (key === aeaKeyMap.s && aeA.o.kw) {
          setCurrentKw('o');
        }
      }
    }
  }, [canvasInfo.scale]);

  return {
    onKwChange,
    resetStore,
    duration,
    rateKw,
    styles,
  };
}

export function usePreviewAnimation({ asset, canvasInfo }: AssetItemProps) {
  const { onKwChange, styles, resetStore } = useAnimation(asset, canvasInfo);
  const { rt_previewAeA } = asset.attribute;
  const [currentTime, setCurrentTime] = useState(0);
  const timerData = useCreation<{
    timer: undefined | number;
    currentTime: number;
  }>(
    () => ({
      timer: undefined,
      currentTime: 0,
    }),
    [],
  );

  const aeaKwInfo = useMemo(() => {
    // eslint-disable-next-line guard-for-in
    for (const key in rt_previewAeA) {
      const target = rt_previewAeA[key as keyof AeA];
      if (target.resId) {
        return {
          resId: target.resId,
          key: key as keyof AeA,
        };
      }
    }
  }, [rt_previewAeA]);

  function updateCurrentTime(time: number) {
    timerData.currentTime = time;
    setCurrentTime(time);
  }

  function startPreview() {
    clearInterval(timerData.timer);
    if (aeaKwInfo) {
      const styleLength = styles[aeaKwInfo.key].length;
      // 预览动画需要在一秒之内播放完成
      const time = Math.round(1000 / styleLength);
      // @ts-ignore
      timerData.timer = setInterval(() => {
        if (timerData.currentTime >= styleLength) {
          clearInterval(timerData.timer);
          updateCurrentTime(0);
          asset.deletePreviewAEAKw();
          resetStore();
          return false;
        }
        updateCurrentTime(timerData.currentTime + 1);
      }, time);
    }
  }

  useEffect(() => {
    if (styles && aeaKwInfo && styles[aeaKwInfo.key].length) {
      startPreview();
    }
  }, [styles]);

  useEffect(() => {
    if (aeaKwInfo && rt_previewAeA) {
      const target = rt_previewAeA[aeaKwInfo.key];
      if (target.kw && target.pbr) {
        onKwChange(target.pbr, target.kw as AeAKw, aeaKwInfo.key);
      }
    }
  }, [rt_previewAeA]);

  function getStyle(): CSSProperties {
    let style: CSSProperties = {};
    if (styles && aeaKwInfo && styles[aeaKwInfo.key].length) {
      style = { ...styles[aeaKwInfo.key][currentTime] };
    }
    return style;
  }

  return {
    getStyle,
  };
}

export function useAssetAnimation({
  asset,
  canvasInfo,
  showOnly,
  videoStatus,
}: AssetItemProps) {
  const { attribute } = asset;
  const newKw = attribute.kw;
  const { startTime, endTime } = attribute;
  const { currentTime } = videoStatus;
  const newAea = getAssetAea(attribute);
  const { i: aeAI, o: aeAO, s: aeAS } = newAea;
  const { onKwChange, styles, duration, rateKw } = useAnimation(
    asset,
    canvasInfo,
  );

  /**
   * @description 自动处理onKwChange
   * @param aeAKey
   */
  function handleChange(aeAKey: keyof AeA) {
    const target = newAea[aeAKey];
    if (target.kw && target.pbr) {
      onKwChange(target.pbr, target.kw as AeAKw, aeAKey);
    }
  }

  function updateAeAI() {
    if (typeof aeAI.kw !== 'string') {
      handleChange(aeaKeyMap.i);
    }
  }

  function updateAeAO() {
    if (typeof aeAO.kw !== 'string') {
      handleChange(aeaKeyMap.o);
    }
  }

  function updateAeAS() {
    if (typeof aeAS.kw !== 'string') {
      handleChange(aeaKeyMap.s);
      // o 的结果依赖 s 的结果，s 更新, o 也要更新
      updateAeAO();
    }
  }

  useEffect(() => {
    // 兼容老版本kw
    if (newKw) {
      onKwChange(aeAS.pbr, newKw as AeAKw, aeaKeyMap.s);
    }
  }, [newKw, aeAS.pbr]);

  useEffect(() => {
    updateAeAI();
  }, [aeAI?.kw, aeAI?.pbr]);

  useEffect(() => {
    updateAeAS();
  }, [newKw, aeAS?.kw, aeAS?.pbr]);

  useEffect(() => {
    updateAeAO();
  }, [aeAO?.kw, aeAO?.pbr]);

  useEffect(() => {
    if (aeAO.resId && !aeAS.resId) {
      updateAeAO();
    }
  }, [aeAO?.resId, aeAS?.resId]);

  function getStyle(): CSSProperties {
    let style: CSSProperties = {};
    if (!showOnly) {
      let kwKey: keyof typeof rateKw | undefined;
      let currentFrame;

      if (asset.attribute.kw) {
        kwKey = 's';
        currentFrame = getCurrentFrame(currentTime - startTime);
      }

      if (
        aeAI.resId &&
        startTime - duration.i <= currentTime &&
        currentTime < startTime
      ) {
        kwKey = 'i';
        currentFrame = getCurrentFrame(currentTime - (startTime - duration.i));
      } else if (
        aeAS.resId &&
        startTime <= currentTime &&
        currentTime < endTime
      ) {
        kwKey = 's';
        currentFrame = getCurrentFrame(currentTime - startTime);
      } else if (aeAO.resId && endTime <= currentTime) {
        kwKey = 'o';
        currentFrame = getCurrentFrame(currentTime - endTime);
      }

      if (kwKey && currentFrame !== undefined) {
        const kw = rateKw?.[kwKey];
        if (kw && kw.op >= 0 && kw.ip >= 0 && styles[kwKey].length > 0) {
          if (currentFrame >= kw.op) {
            style = { ...styles[kwKey][kw.op] };
          } else {
            if (currentFrame >= kw.ip) {
              style = { ...styles[kwKey][currentFrame] };
            }
          }
        }
      }
    }
    return style;
  }

  return {
    getStyle,
  };
}

// 只有未发生 视觉位移或放大缩小 才可以修改
const matrixReg = /matrix\(\s*1,\s*.+,\s*.+,\s*1,\s*0,\s*0\)/;
const canEditMatrix = ['matrix(1, 0, 0, 1, 0, 0)'];
// function testMatrixValue() {
//
// }
function filterStyleFromAssetStyle(assetStyle: CSSProperties) {
  const style: CSSProperties = {};
  style.position = assetStyle.position;
  style.left = assetStyle.left;
  style.top = assetStyle.top;
  style.zIndex = assetStyle.zIndex;
  style.visibility = assetStyle.visibility;
  if (assetStyle.pointerEvents) {
    style.pointerEvents = assetStyle.pointerEvents;
  }
  if (assetStyle.outline) {
    style.outline = assetStyle.outline;
  } // 处理动画数据变化
  return style;
}

export function useAnimationStyle(props: AssetItemProps) {
  const { asset, videoStatus, assetStyle, isPreviewMovie } = props;
  const { rt_previewAeA } = asset.attribute;
  const { playStatus } = videoStatus;

  const isPlaying = useMemo(() => {
    return playStatus === PlayStatus.Playing;
  }, [playStatus]);

  const usefulStyle = filterStyleFromAssetStyle(assetStyle);

  const { getStyle } = useAssetAnimation(props);
  const { getStyle: previewStyle } = usePreviewAnimation(props);
  let style = getStyle();
  if (rt_previewAeA) {
    style = previewStyle();
  } else if (!isPlaying && !isPreviewMovie) {
    style = {};
  }
  return {
    style: {
      ...usefulStyle,
      ...style,
    },
  };
}
