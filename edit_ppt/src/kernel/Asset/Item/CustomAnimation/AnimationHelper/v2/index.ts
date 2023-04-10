import { CSSProperties, useEffect, useMemo, useCallback } from 'react';
import { useCreation } from 'ahooks';
import { AeAItem, AssetItemProps } from '@kernel/typing';
import { getAssetAea } from '@kernel/utils/StandardizedTools';
import { PlayStatus } from '@kernel/utils/const';
import { AnimationV2, getDuration } from './helper';
import { getCurrentFrame } from '../v1';

function getDefaultKwInfo() {
  return {
    css: [],
    cssWithPBR: [],
    styles: [],
    duration: 0,
    delay: 0,
  };
}

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

function useAssetAnimation({
  asset,
  canvasInfo,
  showOnly,
  videoStatus,
}: AssetItemProps) {
  const kwInfo = useCreation(
    () => ({
      i: getDefaultKwInfo(),
      s: getDefaultKwInfo(),
      o: getDefaultKwInfo(),
    }),
    [],
  );

  const aea = getAssetAea(asset.attribute);
  const { i: aeAI, o: aeAO, s: aeAS } = getAssetAea(asset.attribute);

  const updater = useCallback((key: string) => {
    // @ts-ignore
    const target = aea[key] as AeAItem;
    if (target.resId && target.kw) {
      // @ts-ignore
      AnimationV2.computeAssetAnimation(target);
      const css = AnimationV2.computeAssetAnimationMatrix(
        AnimationV2.getAssetCss(target.resId),
        key,
        1,
      );
      const cssWithPBR = AnimationV2.getPlaybackRateKW(css, target.pbr);
      const styles = AnimationV2.computeAnimation(cssWithPBR);
      const duration = getDuration(cssWithPBR);
      // @ts-ignore
      kwInfo[key] = {
        css,
        cssWithPBR,
        styles,
        duration,
        delay: target.kw.ip,
      };
    }
  }, []);

  useEffect(() => {
    updater('i');
  }, [aeAI?.kw, aeAI?.pbr]);

  useEffect(() => {
    updater('s');
  }, [aeAS?.kw, aeAS?.pbr]);

  useEffect(() => {
    updater('o');
  }, [aeAO?.kw, aeAO?.pbr]);

  const getCurrentFrameAndKey = useCallback(() => {
    const { startTime, endTime } = asset.attribute;
    const { currentTime } = videoStatus;
    let kwKey: string | undefined;
    let currentFrame: number | undefined;

    if (
      aeAI.resId &&
      startTime - kwInfo.i.duration <= currentTime &&
      currentTime < startTime
    ) {
      kwKey = 'i';
      currentFrame = getCurrentFrame(
        currentTime - (startTime - kwInfo.i.duration),
      );
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

    return {
      kwKey,
      currentFrame,
    };
  }, []);

  const getStyle = useCallback(() => {
    let style: CSSProperties = {};
    if (showOnly) {
      return style;
    }
    const { kwKey, currentFrame } = getCurrentFrameAndKey();
    if (kwKey && currentFrame) {
      // @ts-ignore

      const { cssWithPBR, styles } = kwInfo[kwKey];
      if (
        cssWithPBR &&
        cssWithPBR.op >= 0 &&
        cssWithPBR.ip >= 0 &&
        styles.length > 0
      ) {
        if (currentFrame >= cssWithPBR.op) {
          style = { ...styles[kwKey][cssWithPBR.op] };
        } else {
          if (currentFrame >= cssWithPBR.ip) {
            style = { ...styles[kwKey][currentFrame] };
          }
        }
      }
    }
    return style;
  }, []);

  return {
    getStyle,
  };
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
  let style = getStyle();
  if (rt_previewAeA) {
    // style = previewStyle();
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
