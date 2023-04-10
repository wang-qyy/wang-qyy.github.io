import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { config } from '@kernel/utils/config';
import type {
  DefaultAssetProps,
  Asset,
  AssetGravity,
  Shadow,
} from '@kernel/typing';
import {
  assetAlwaysVisible,
  assetIsSelectable,
  isTempModuleType,
} from '@kernel/utils/assetChecker';
import {
  getAssetStatus,
  getAuxiliaryTargetIndex,
  getEditAsset,
} from '@kernel/store';
import { PlayStatus } from '@kernel/utils/const';
import { createClassName } from '@kernel/utils/StandardizedTools';
import { buildGeneralStyle } from '@kernel/utils/assetHelper/pub';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { autorun } from 'mobx';

export function useAssetStatus(props: DefaultAssetProps) {
  const {
    asset,
    showOnly,
    canvasInfo,
    videoInfo,
    videoStatus,
    isPreviewMovie,
    index,
    parentAsset,
    previewAll,
    manualPreview,
  } = props;
  const { scale } = canvasInfo;
  const auxiliaryTargetIndex =
    showOnly || isPreviewMovie ? [] : getAuxiliaryTargetIndex();

  const { allAnimationTime } = videoInfo;
  // const { currentTime } = videoStatus;
  const {
    meta,
    assetDuration,
    containerSize,
    assetTransform,
    animationItemDuration,
    assetPosition,
    isAea,
    attribute,
  } = asset;

  const [AniAssetHidden, setAniAssetHidden] = useState(true);
  useEffect(() =>
    autorun(() => {
      setAniAssetHidden(
        (() => {
          if (
            assetAlwaysVisible(asset) ||
            previewAll ||
            (!isPreviewMovie && asset.attribute.rt_previewAeA)
          ) {
            asset.setTempData?.({
              rt_hideInCanvas: false,
            });
            // 如果tempModule的不存在子元素，则隐藏,否则无论什么时候都展示
            return false;
          }
          const { currentTime } = videoStatus;
          if (
            currentTime === allAnimationTime &&
            attribute.endTime === allAnimationTime
          ) {
            // 当前时间在最后一秒 并且 元素结束时间在最后一秒
            return false;
          }

          const { animation } = attribute;
          const enterBaseId = animation?.enter?.baseId ?? 0;
          const exitBaseId = animation?.exit?.baseId ?? 0; // 是后续添加的文字动画

          let status = true;
          const existExtraTextAnimation = false;

          if (
            currentTime >= assetDuration.startTime &&
            currentTime <= assetDuration.endTime
          ) {
            status = false;
          }
          asset.setTempData?.({
            rt_hideInCanvas: status,
          });
          return status;
        })(),
      );
    }),
  );

  const style = useMemo(() => {
    const result: CSSProperties = {
      position: 'absolute',
      ...buildGeneralStyle(asset),
    };
    // // 针对视频蒙版子图层的回补
    // if (
    //   parentAsset &&
    //   parentAsset.meta.type === 'mask' &&
    //   parentAsset?.transform
    // ) {
    //   // @ts-ignore
    //   result.left -= parentAsset?.transform?.posX;
    //   // @ts-ignore
    //   result.top -= parentAsset?.transform?.posY;
    //   result.transform = ``;
    // }
    if (AniAssetHidden) {
      result.opacity = 0;
      result.zIndex = config.minZIndex;
      result.pointerEvents = 'none';
    }

    result.display = meta.hidden ? 'none' : 'block';
    if (isTempModuleType(asset)) {
      result.zIndex = (result.zIndex as number) - 1;
      result.outline = `${1 / scale}px dashed rgba(255, 255, 255, 0.7)`;
    }

    if (assetIsSelectable(asset) && !isPreviewMovie) {
      result.cursor = 'move';
    } else {
      result.pointerEvents = 'none';
    }
    if (meta.transferLocation) {
      result.zIndex = config.maxZIndex - 100;
      result.pointerEvents = 'none';
      // 转场数据，只有在拨动时间以及播放时候 显示
      if (!manualPreview && videoStatus.playStatus !== 1) {
        result.opacity = 0;
      }
    }
    if (meta.isLogo) {
      result.zIndex = config.maxZIndex - 99;
      result.pointerEvents = 'none';
    }

    return result;
  }, [
    AniAssetHidden,
    containerSize,
    assetTransform,
    containerSize,
    assetPosition,
    scale,
    meta.hidden,
    manualPreview,
    videoStatus.playStatus,
  ]);

  const assetClassName = useMemo(() => {
    return createClassName(asset, showOnly || false);
  }, [meta.className, showOnly]);

  const auxiliaryBolder = useMemo<CSSProperties>(() => {
    return auxiliaryTargetIndex?.includes(index as number)
      ? {
          outline: `${1 / scale}px dashed rgba(255, 255, 255, 0.7)`,
        }
      : {};
  }, [auxiliaryTargetIndex, scale]);

  return useMemo(
    () => ({
      style,
      assetClassName,
      AniAssetHidden,
      auxiliaryBolder,
      showCustomAnimation: asset.isAea,
      // asset.isAllAnimation
      isHasAnimation: asset.isAllAnimation,
    }),
    [
      style,
      assetClassName,
      AniAssetHidden,
      auxiliaryBolder,
      asset.isAea,
      asset.isAllAnimation,
    ],
  );
}

export function isPlaying(playStatus: PlayStatus) {
  return playStatus === PlayStatus.Playing;
}

export function transformGravityToCssProperties(gravity: AssetGravity) {
  let posX = 'left';
  let posY = 'top';

  switch (gravity) {
    case 'nw': // 左上
      posX = 'left';
      posY = 'top';
      break;
    case 'north': // 中上
      posX = 'center';
      posY = 'top';
      break;
    case 'ne': // 右上
      posX = 'right';
      posY = 'top';
      break;
    case 'west': // 左中
      posX = 'left';
      posY = 'center';
      break;
    case 'center': // 中部
      posX = 'center';
      posY = 'center';
      break;
    case 'east': // 右中
      posX = 'right';
      posY = 'center';
      break;
    case 'sw': // 左下
      posX = 'left';
      posY = 'bottom';
      break;
    case 'south': // 中下
      posX = 'center';
      posY = 'bottom';
      break;
    case 'se': // 右下
      posX = 'right';
      posY = 'bottom';
      break;
  }

  return [posX, posY];
}

export const useShadowStyle = (shadow?: Shadow, box?: boolean) => {
  if (!shadow) return '';
  const { x = 0, y = 0, blur = 0, color = '#000', spread = 0 } = shadow;
  if (box) {
    return `box-shadow(${color} ${x}px ${y}px ${blur}px ${spread}px)`;
  }
  return `drop-shadow(${color} ${x}px ${y}px ${blur}px)`;
};
