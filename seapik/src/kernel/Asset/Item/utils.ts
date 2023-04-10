import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { config } from '@kernel/utils/config';
import type { DefaultAssetProps, AssetGravity, Shadow } from '@kernel/typing';
import {
  assetIsSelectable,
  isTempModuleType,
} from '@kernel/utils/assetChecker';
import { getAuxiliaryTargetIndex } from '@kernel/store';
import { PlayStatus } from '@kernel/utils/const';
import { createClassName } from '@kernel/utils/StandardizedTools';
import { buildGeneralStyle } from '@kernel/utils/assetHelper/pub';

export function useAssetStatus(props: DefaultAssetProps) {
  const {
    asset,
    showOnly,
    canvasInfo,
    videoStatus,
    isPreviewMovie,
    index,
    parentAsset,
    manualPreview,
  } = props;
  const { scale } = canvasInfo;
  const auxiliaryTargetIndex =
    showOnly || isPreviewMovie ? [] : getAuxiliaryTargetIndex();

  const { meta, containerSize, assetTransform, assetPosition } = asset;

  const style = useMemo(() => {
    const result: CSSProperties = {
      position: 'absolute',
      ...buildGeneralStyle(asset),
    };

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

    return result;
  }, [
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
      auxiliaryBolder,
    }),
    [style, assetClassName, auxiliaryBolder],
  );
}

export function isPlaying(playStatus: PlayStatus) {
  return playStatus === PlayStatus.Playing;
}

export const useShadowStyle = (shadow?: Shadow, box?: boolean) => {
  if (!shadow) return '';
  const { x = 0, y = 0, blur = 0, color = '#000', spread = 0 } = shadow;
  if (box) {
    return `box-shadow(${color} ${x}px ${y}px ${blur}px ${spread}px)`;
  }
  return `drop-shadow(${color} ${x}px ${y}px ${blur}px)`;
};
