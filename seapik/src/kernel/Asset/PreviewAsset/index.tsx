import React from 'react';
import { PlayStatus } from '@kernel/utils/const';
import AssetItem from '../Item';
import { AssetBaseSize, AssetClass } from '../../typing';

export interface PreviewAssetProps {
  asset: AssetClass;
  size: AssetBaseSize;
}

function PreviewAsset({ asset, size }: PreviewAssetProps) {
  const props = {
    asset,
    index: -1,
    showOnly: false,
    isPreviewMovie: true,
    AssetRootRef: {
      current: null,
    },
    canvasInfo: {
      ...size,
      scale: 1,
    },
    videoInfo: {
      startTime: 0,
      endTime: 1000,
      allAnimationTime: 1000,
    },
    videoStatus: {
      playStatus: PlayStatus.Stopped,
      currentTime: 0,
    },
    prefix: '',
    // 当前选中元素的索,
    assetActive: -1,
  };
  return <AssetItem {...props} />;
}

export default PreviewAsset;
