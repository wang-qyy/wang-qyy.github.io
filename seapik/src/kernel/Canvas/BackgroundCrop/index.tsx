import { MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { getEditAsset, getAssetStatus, getCanvasInfo } from '@/kernel/store';
import { AssetClass, Coordinate, RectLimit } from '@/kernel/typing';

import { mouseMoveDistance } from '@kernel/Canvas/AssetOnMove/utils';
import Transform from './Transform';
import { useGetCropInfo } from '@AssetCore/Item/Background/hooks';

import './index.less';

function checkCropPosition(position: Coordinate, limit: RectLimit) {
  const newPosition = { ...position };
  if (newPosition.x > limit.xMax) {
    newPosition.x = limit.xMax;
  }
  if (newPosition.x < limit.xMin) {
    newPosition.x = limit.xMin;
  }

  return newPosition;
}

const BackgroundCrop = observer(({ asset }: { asset: AssetClass }) => {
  const { scale } = getCanvasInfo();

  const { attribute } = asset;
  const { rotate } = asset.transform;

  const previewStyle = {
    ...asset.assetSizeScale,
    ...asset.assetPositionScale,
  };

  const { originStyle, transformOrigin } = useGetCropInfo(asset, true);

  const originAbsolute = {
    top: asset.cropPositionScale.y + asset.assetPositionScale.top,
    left: asset.cropPositionScale.x + asset.assetPositionScale.left,
  };

  function onChangePosition(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();

    const { left, top } = asset.assetPositionScale;

    const { x: cropX, y: cropY } = asset.cropPositionScale;

    const limit = {
      xMin: asset.assetSizeScale.width - asset.assetOriginSizeScale.width,
      xMax: 0,
      yMin: 0,
      yMax: 0,
    };

    mouseMoveDistance(
      (x, y) => {
        let cropPosition = { x: cropX - x, y: cropY - y };

        if (rotate === 90) {
          cropPosition = { x: cropX - y, y: cropY + x };
        } else if (rotate === 180) {
          cropPosition = { x: cropX + x, y: cropY + y };
        } else if (rotate === 270) {
          cropPosition = { x: cropX + y, y: cropY - x };
        }

        asset.update({
          attribute: {
            crop: {
              size: asset.assetOriginSize,
              position: {
                x: cropPosition.x / scale,
                y: cropPosition.y / scale,
              },
            },
          },
          transform: {
            posX: (left + x) / scale,
            posY: (top + y) / scale,
          },
        });
      },
      () => {},
    );
  }

  const flip = {
    transform: `scale(${asset.transform.flipX ? -1 : 1} ,${
      asset.transform.flipY ? -1 : 1
    })`,
  };

  return (
    <div className="background-crop-wrap">
      {/* 裁剪后的实际效果 */}
      <div
        className="crop-preview-background"
        style={{
          ...previewStyle,
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseDown={onChangePosition}
        draggable={false}
      >
        <div style={{ ...originStyle, ...transformOrigin }}>
          <img
            src={attribute.picUrl}
            draggable={false}
            style={{ width: '100%', ...flip }}
          />
        </div>

        {/* 分割线 */}
        <>
          <div
            className="hc-background-clipper-divider hc-background-clipper-divider-v"
            style={{ left: '33%' }}
          />
          <div
            className="hc-background-clipper-divider hc-background-clipper-divider-v"
            style={{ left: '66%' }}
          />
          <div
            className="hc-background-clipper-divider hc-background-clipper-divider-h"
            style={{ top: '33%' }}
          />
          <div
            className="hc-background-clipper-divider hc-background-clipper-divider-h"
            style={{ top: '66%' }}
          />
        </>
      </div>
      {/* 原始图片 */}
      <div
        className="crop-origin-background"
        style={{
          ...originStyle,
          ...originAbsolute,
          opacity: 0.5,
          pointerEvents: 'none',
          ...transformOrigin,
        }}
        draggable={false}
      >
        <img
          src={attribute.picUrl}
          width="100%"
          draggable={false}
          style={{ ...flip }}
        />
      </div>

      <Transform
        style={{ ...previewStyle }}
        asset={asset}
        originAbsolute={asset.cropPositionScale}
      />
    </div>
  );
});

function BackgroundCropWrap() {
  const editAsset = getEditAsset();

  const { inMask } = getAssetStatus();

  if (editAsset?.meta.isBackground && inMask) {
    return <BackgroundCrop asset={editAsset} />;
  }

  return <></>;
}

export default observer(BackgroundCropWrap);
