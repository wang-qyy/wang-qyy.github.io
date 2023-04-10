import { observer } from 'mobx-react';
import type { AssetItemProps } from '@kernel/typing';
import Image from '@kernel/Components/Image';
import { coordinateToPosition } from '@kernel/utils/mouseHandler/mouseHandlerHelper';

import { getAvailableFilters } from '../Image/utils';

import { useGetCropInfo } from './hooks';

import FabricImage from '../Image/FabricImage';

export default observer((props: AssetItemProps) => {
  const { asset } = props;

  const { transform, attribute } = asset;
  const { filters, picUrl, rt_blob_url } = attribute;
  const src = picUrl === 'loading' ? '' : picUrl;

  const originSize = {
    ...asset.assetOriginSize,
  };

  const { transformOrigin } = useGetCropInfo(asset);

  function renderImage() {
    const availableFilters = filters && getAvailableFilters(filters);
    if (availableFilters) {
      return (
        <FabricImage
          src={src || ''}
          style={originSize}
          filters={availableFilters}
          asset={asset}
        />
      );
    }
    if (rt_blob_url) {
      return <img style={{ width: '100%' }} alt="img" src={rt_blob_url} />;
    }

    return <Image src={asset.attribute.picUrl} style={{ width: '100%' }} />;
  }

  return (
    <div
      aria-label="background"
      style={{
        ...originSize,
        position: 'relative',
        ...coordinateToPosition(asset.cropPosition),
        transform: `rotate(${transform.rotate}deg) `,
        ...transformOrigin,
      }}
    >
      <div
        style={{
          ...originSize,
          position: 'absolute',
          transform: `scale(${asset.transform.flipX ? -1 : 1} ,${
            asset.transform.flipY ? -1 : 1
          })`,
        }}
      >
        {renderImage()}
        {/* <Image src={asset.attribute.picUrl} style={{ width: '100%' }} /> */}
      </div>
    </div>
  );
});
