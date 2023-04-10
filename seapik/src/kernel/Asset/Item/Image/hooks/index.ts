import { CSSProperties } from 'react';
import type { AssetClass } from '@kernel/typing';

import { coordinateToPosition } from '@kernel/utils/mouseHandler/mouseHandlerHelper';

export function useStyle(asset: AssetClass) {
  const { attribute, transform } = asset;
  const { width = 0, height = 0 } = attribute;

  function getImgStyle(): CSSProperties {
    const imgStyle: CSSProperties = {
      ...asset.assetOriginSize,
      position: 'absolute',
      ...coordinateToPosition(asset.cropPosition),
    };

    // 翻转
    if (transform.flipX || transform.flipY) {
      Object.assign(imgStyle, {
        transform: `scaleX(${transform.flipX ? -1 : 1}) scaleY(${
          transform.flipY ? -1 : 1
        })`,
      });
    }

    return imgStyle;
  }

  function getImgContainer() {
    return {
      width,
      height,
      transformOrigin: '0 0 0',
    };
  }

  return {
    getImgStyle,
    getImgContainer,
  };
}

export function useCanvas() {}
