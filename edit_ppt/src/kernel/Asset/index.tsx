import React, { CSSProperties, useRef } from 'react';
import { getEditAsset, getManualPreview } from '@kernel/store';
import { observer } from 'mobx-react';
import { action, makeObservable, observable, toJS } from 'mobx';
import { useCreation } from 'ahooks';
import { isEqual } from 'lodash-es';

import { PlayStatus } from '@kernel/utils/const';
import { EffectAsset, formatEffectAssets, useCanvasBackground } from './utils';
import AssetItem from './Item';
import EffectLayer from './Item/EffectLayer';
import { useCameras } from './hook';
import {
  CanvasInfo,
  VideoStatus,
  Assets,
  TemplateVideoInfo,
  PageAttr,
  VideoClip,
  AssetClass,
  ManualCurrent,
} from '../typing';
import './index.less';
import AssetItemState from '../store/assetHandler/asset';

export interface AssetProps {
  isPreview: boolean;
  manualPreview?: boolean;
  manualCurrentTime?: ManualCurrent;
  canvasInfo: CanvasInfo;
  videoStatus: VideoStatus;
  videoInfo: TemplateVideoInfo;
  assets: AssetClass[];
  templateIndex: number;
  prefix: string;
  showOnly?: boolean;
  pageAttr?: PageAttr;
  style?: CSSProperties;
  offsetTime?: VideoClip;
  whole?: boolean; // 是否为全片段
  isTranstionRender?: boolean; // 是否是转场片段渲染
}

/**
 * @description 辅助数据层，用以包装一些需要二次处理的数据
 * 由于直接重组数据会导致数据的不必要渲染，所以需要重新包装为proxy
 */
class SecondaryStore {
  offsetTime: VideoClip = [0, 0];

  @observable videoStatus: VideoStatus = {
    playStatus: PlayStatus.Stopped,
    currentTime: 0,
  };

  constructor() {
    makeObservable(this);
  }

  @action
  updatePageCut = (offsetTime: VideoClip) => {
    this.offsetTime = offsetTime;
  };

  @action
  updateVideoStatus = (
    videoStatus: VideoStatus,
    manualCurrentTime?: ManualCurrent,
  ) => {
    const { playStatus, currentTime, speed = 1 } = videoStatus;
    const [clipStart] = this.offsetTime;

    if (manualCurrentTime) {
      const currentTimeBySpeed = manualCurrentTime.currentTime / (1 / speed);
      Object.assign(this.videoStatus, {
        playStatus,
        currentTime: clipStart + currentTimeBySpeed,
      });
    } else {
      const currentTimeBySpeed = currentTime / (1 / speed);
      Object.assign(this.videoStatus, {
        playStatus,
        currentTime: clipStart + currentTimeBySpeed,
      });
    }
  };
}

export const AssetList = observer((props: AssetProps) => {
  const {
    isPreview,
    videoInfo,
    pageAttr,
    prefix,
    canvasInfo,
    videoStatus,
    assets,
    style,
    showOnly,
    whole,
    manualPreview,
  } = props;
  const AssetRootRef = useRef<HTMLDivElement>(null);
  const editAsset = getEditAsset();
  const effectAssets = formatEffectAssets(assets);
  const backgroundStyle = useCanvasBackground(canvasInfo, pageAttr);

  const assetProps = {
    showOnly: !!showOnly,
    canvasInfo,
    videoInfo,
    manualPreview,
    videoStatus,
    isPreviewMovie: isPreview,
    assetActive: editAsset?.id,
    AssetRootRef,
    prefix,
  };

  const styleResult: CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    ...backgroundStyle,
    ...style,
    transformOrigin: '0 0 0',
    transform: `${style?.transform ?? ''} translateZ(0px)`,
  };

  const renderAsset = (asset: AssetItemState | EffectAsset) => {
    const item = asset;
    // 特效层
    if ((item as EffectAsset).isEffect) {
      const effectAsset = item as EffectAsset;
      return (
        <EffectLayer
          asset={effectAsset.asset}
          index={effectAsset.asset.id}
          {...assetProps}
        >
          {effectAsset.assetList.map((t) => renderAsset(t))}
        </EffectLayer>
      );
    }
    const assetItem = item as AssetItemState;
    // 占位元素 不具有实际展现意义
    if (assetItem?.meta.type === 'plain') {
      return;
    }
    const { startTime, endTime } = assetItem.assetDuration;
    const { offsetTime = [0, 0], pageTime = 0 } = videoInfo;
    const [cs, ce] = offsetTime;
    // 是否被裁减掉
    const inView =
      (startTime <= cs && endTime >= cs) ||
      (startTime >= cs && startTime < pageTime - ce);
    // 过滤掉已经被裁剪掉的元素
    if (inView) {
      return (
        <AssetItem
          {...assetProps}
          asset={assetItem}
          index={assetItem.id}
          key={`${prefix}-${assetItem.id}`}
          whole={whole}
        />
      );
    }
    return null;
  };

  return (
    <div className="hc-core-assets" style={styleResult} ref={AssetRootRef}>
      {effectAssets?.map((item) => renderAsset(item))}
    </div>
  );
});

const Asset = observer((props: AssetProps) => {
  const {
    videoStatus,
    style,
    manualCurrentTime,
    videoInfo: { offsetTime = [0, 0], speed },
    canvasInfo,
    assets,
    manualPreview,
  } = props;
  // 是否处于播放状态 手动播放 也是播放状态
  const isPlaying = videoStatus.playStatus === 1 || manualPreview;

  const secondary = useCreation(() => {
    return new SecondaryStore();
  }, []);
  const { style: cameraStyle } = useCameras(props);
  if (!isEqual(secondary.offsetTime, offsetTime)) {
    secondary.updatePageCut(offsetTime);
  }
  secondary.updateVideoStatus({ ...videoStatus, speed }, manualCurrentTime);
  // 转场的图层数据
  const transitionList = assets.filter((item) => item.meta.isTransfer);
  // 排查转场以外的数据
  const noTransitionList = assets.filter((item) => !item.meta.isTransfer);

  return (
    <>
      <div
        style={{
          ...style,
          width: canvasInfo.width,
          height: canvasInfo.height,
          position: 'absolute',
          overflow: 'hidden',
          transform: `${style?.transform ?? ''} translateZ(0px)`,
        }}
      >
        <div
          style={{
            width: canvasInfo.width,
            height: canvasInfo.height,
            transformOrigin: 'left top',
            position: 'absolute',
            overflow: 'hidden',
            zIndex: 1,
            left: 0,
            top: 0,
            ...cameraStyle,
          }}
        >
          <AssetList
            {...props}
            style={undefined}
            videoStatus={secondary.videoStatus}
            assets={noTransitionList}
          />
        </div>
        <div
          style={{
            width: canvasInfo.width,
            height: canvasInfo.height,
            transformOrigin: 'left top',
            position: 'absolute',
            zIndex: isPlaying && transitionList.length > 0 ? 2 : -1,
            pointerEvents: 'none',
            transform: `translateZ(0px)`,
          }}
        >
          <AssetList
            {...props}
            style={{ background: 'transparent' }}
            videoStatus={secondary.videoStatus}
            assets={transitionList}
          />
        </div>
      </div>
    </>
  );
});
export default Asset;
