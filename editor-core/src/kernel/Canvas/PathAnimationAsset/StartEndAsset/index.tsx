import { useAssetItem } from '@/kernel/Asset/Item';
import { getRelativeCurrentTime } from '@/kernel/store';
import { AssetClass, CanvasInfo } from '@/kernel/typing';
import { observer } from 'mobx-react';
import { CSSProperties } from 'react';
import './index.less';

const StartEndAsset = (props: {
  asset: AssetClass;
  canvasInfo: CanvasInfo;
  style: CSSProperties;
  scale: {
    x: number;
    y: number;
  };
  prefix: string;
}) => {
  const { asset, canvasInfo, scale, prefix, ...reset } = props;
  const { meta } = asset;
  const currentTime = getRelativeCurrentTime();
  const AssetDom = useAssetItem(asset, meta.type);
  const animationProps = {
    asset,
    index: 0,
    assetActive: true,
    isPreviewMovie: false,
    parentAsset: undefined,
    showOnly: true,
    assetStyle: {},
    assetClassName: '',
    isAssetActive: false,
    AssetRootRef: null,
    canvasInfo,
    prefix,
    videoInfo: {},
    videoStatus: {
      playStatus: -1,
      currentTime,
    },
  };
  return (
    <div {...reset} className="asset-item">
      <div
        style={{
          width: '100%',
          height: '100%',
          transformOrigin: '0 0',
          transform: `scale(${(scale?.x || 1) * canvasInfo.scale},${
            (scale?.y || 1) * canvasInfo.scale
          })`,
          cursor: 'move',
        }}
      >
        <AssetDom {...animationProps} />
      </div>
    </div>
  );
};
export default observer(StartEndAsset);
