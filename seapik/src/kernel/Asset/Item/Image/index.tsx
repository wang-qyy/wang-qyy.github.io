import React from 'react';
import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import Image from '@kernel/Components/Image';
// import ImageWithFilters from '../ImageWithFilters';
import { assetIdPrefix } from '@/kernel/utils/const';
import { useStyle } from './hooks';
import ImageClip from './ImageClip';
import { transformGravityToCssProperties } from '../utils';
import FabricImage from './FabricImage';
import { getAvailableFilters } from './utils';

const ImageAsset = (props: AssetItemProps) => {
  const { asset, canvasInfo, whole } = props;
  const { attribute, id } = asset;
  const {
    picUrl,
    filters,
    container,
    imageEffects,
    isFill,
    gravity = 'nw',
    width,
    scale: imgScale = 100, // 25~100
    rt_blob_url,
  } = attribute;
  const src = picUrl === 'loading' ? '' : picUrl;

  // TODO: 有filters?.resId的会走滤镜组件
  // const needImageShop = !!(
  //   container?.source_key ||
  //   imageEffects ||
  //   filters?.resId
  // );

  const needImageShop = !!(container?.source_key || imageEffects);

  const { getImgStyle, getImgContainer, getCanvasStyle } = useStyle(asset);

  const [posX, posY] = transformGravityToCssProperties(gravity);

  if (asset.meta.isLogo) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `url(${picUrl}) ${
            isFill ? 'repeat' : 'no-repeat'
          } ${posX} ${posY} / ${width * 0.3 * (imgScale / 100)}px`,
        }}
      />
    );
  }

  const checkImage = () => {
    const availableFilters = whole && filters && getAvailableFilters(filters);
    console.log('checkImage', { availableFilters, rt_blob_url });

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
      style={{
        ...getImgContainer(),
        opacity: asset.tempData?.rt_hover?.isHover ? '0.3' : 1,
      }}
    >
      {/* TODO: 原来老裁剪逻辑，目前走不到这个组件 */}
      {needImageShop ? (
        <ImageClip
          style={getCanvasStyle()}
          asset={asset}
          canvasInfo={canvasInfo}
        />
      ) : (
        checkImage()
      )}
    </div>
  );
};

export default observer(ImageAsset);
