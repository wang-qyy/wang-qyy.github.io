import { observer } from 'mobx-react';
import type { AssetItemProps, AssetIndex } from '@kernel/typing';
import AssetItem from '@kernel/Asset/Item';
import { CSSProperties } from 'react';
import { useContainerSize } from './utils';
import { useMaskHandler } from './hooks';
import DragView from './dragView';

function calcIndex(assetIndex: AssetIndex, index: number) {
  if (typeof assetIndex === 'number') {
    return [assetIndex, index];
  }
  return [...assetIndex, index];
}
const Mask = (props: AssetItemProps) => {
  const {
    asset,
    canvasInfo,
    index,
    isPreviewMovie = false,
    prefix = '',
  } = props;
  const { size } = useContainerSize(asset);
  const { assets, tempData, attribute } = asset;
  const rt_asset = tempData?.rt_asset;
  const { MaskContainer, clipPath, loading } = useMaskHandler(
    asset,
    canvasInfo,
    isPreviewMovie,
    prefix,
  );
  const rtAssetStyle: CSSProperties = () => {
    if (rt_asset) {
      const { attribute: rAttribute } = rt_asset;
      return {
        width: rAttribute.width,
        height: rAttribute.height,
        left: (attribute.width - rAttribute.width) / 2,
        top: (attribute.height - rAttribute.height) / 2,
        position: 'absolute',
      };
    }
    return {
      width: '100%',
      height: '100%',
    };
  };
  return (
    <>
      <DragView {...props} />
      <div
        className="assetElement"
        style={{
          overflow: 'hidden',
          ...size,
          position: 'relative',
        }}
      >
        <div ref={MaskContainer} />
        {/* 蒙层的字结点 */}
        <div
          style={{
            transformOrigin: '0 0',
            position: 'relative',
            touchAction: 'manipulation',
            width: '100%',
            height: '100%',
            clipPath: `url(#${clipPath}`,
            overflow: 'hidden',
          }}
        >
          {!loading && clipPath && rt_asset && (
            <div style={rtAssetStyle()} className="assetElementMaskRtAsset">
              <img
                src={
                  (rt_asset.attribute.picUrl ||
                    rt_asset.attribute.rt_preview_url) ??
                  ''
                }
              />
            </div>
          )}
          {/* 子图层显示优化 */}
          {!loading &&
            clipPath &&
            !rt_asset &&
            assets?.map((item, i) => {
              return (
                <AssetItem
                  {...props}
                  asset={item}
                  parentAsset={asset}
                  previewAll
                  index={calcIndex(index, i)}
                  key={`mask-${item.meta.id}`}
                />
              );
            })}
        </div>
        {loading && <i className="iconfont icon-xuanzhuan assetImgLoad" />}
      </div>
    </>
  );
};
export default observer(Mask);
