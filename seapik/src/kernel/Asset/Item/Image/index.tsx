import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import Image from '@kernel/Components/Image';
import { assetIdPrefix } from '@/kernel/utils/const';
import { useStyle } from './hooks';
import FabricImage from './FabricImage';
import { getAvailableFilters } from './utils';

import { useMaskHandler } from '../Mask/hooks';

const ImageAsset = (props: AssetItemProps) => {
  const {
    asset,
    canvasInfo,
    whole,
    isPreviewMovie = false,
    prefix = '',
  } = props;
  const { attribute, id } = asset;
  const { picUrl, filters, container, rt_blob_url } = attribute;
  const src = picUrl === 'loading' ? '' : picUrl;

  const { getImgStyle, getImgContainer } = useStyle(asset);

  const { MaskContainer, clipPath, loading } = useMaskHandler(
    asset,
    canvasInfo,
    isPreviewMovie,
    prefix,
  );

  const checkImage = () => {
    const availableFilters = whole && filters && getAvailableFilters(filters);
    if (availableFilters) {
      return (
        <FabricImage
          src={src || ''}
          style={getImgStyle()}
          filters={availableFilters}
          asset={asset}
        />
      );
    }
    if (rt_blob_url) {
      return <img style={getImgStyle()} alt="img" src={rt_blob_url} />;
    }
    return (
      <Image
        alt="img"
        src={src}
        crossOrigin="anonymous"
        data-asset-id={`${assetIdPrefix}${id}`}
        style={getImgStyle()}
        draggable="false"
      />
    );
  };

  // todo 暂时不支持滤镜裁剪兼容，所以保留原来的裁剪逻辑
  return (
    <div
      className="assetWrapper"
      aria-label="image wrapper"
      style={{
        // ...getImgContainer(),
        width: '100%',
        height: '100%',
        opacity: asset.tempData?.rt_hover?.isHover ? '0.3' : 1,
        clipPath: `url(#${clipPath}`,
        transform: `scale(${asset.tempData?.rt_itemScale})`,
        transformOrigin: '0 0 0',
      }}
    >
      <div ref={MaskContainer} />

      {checkImage()}
    </div>
  );
};

export default observer(ImageAsset);
