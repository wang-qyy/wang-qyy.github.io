import { CSSProperties } from 'react';
import { useCreation } from 'ahooks';
import { getCanvasInfo } from '@/kernel';

import { AssetClass } from '@/kernel/typing';
import { coordinateToPosition } from '@kernel/utils/mouseHandler/mouseHandlerHelper';

export function useGetCropInfo(asset: AssetClass, autoScale: boolean = false) {
  const { scale } = getCanvasInfo();

  const { crop } = asset.attribute;
  const { rotate } = asset.transform;

  // 原图样式
  const originStyle: CSSProperties = useCreation(() => {
    if (crop) {
      return {
        ...asset.assetOriginSizeScale,
        ...coordinateToPosition(asset.cropPositionScale),
        position: 'absolute',
        transform: `rotate(${rotate}deg)`,
      };
    }

    return {};
  }, [crop, scale, rotate]);

  const transformOrigin = useCreation(() => {
    let xCenter = asset.assetSize.width / 2 - asset.cropPosition.x;
    let yCenter = asset.assetSize.height / 2 - asset.cropPosition.y;

    if (rotate === 90) {
      yCenter = asset.assetSize.width / 2 - asset.cropPosition.y;
    } else if (rotate === 270) {
      xCenter = asset.assetSize.height / 2 - asset.cropPosition.x;
      yCenter = asset.assetSize.height / 2 - asset.cropPosition.y;
    }

    if (autoScale) {
      xCenter *= scale;
      yCenter *= scale;
    }

    let transformOrigin = `${xCenter}px ${yCenter}px`;

    return { transformOrigin };
  }, [asset.assetSize, asset.cropPosition, rotate]);

  return { originStyle, transformOrigin };
}
