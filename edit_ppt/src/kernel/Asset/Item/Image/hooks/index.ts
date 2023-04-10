import type { AssetClass } from '@kernel/typing';
import { CSSProperties } from 'react';

export function useStyle(asset: AssetClass) {
  const { attribute, transform } = asset;
  const {
    cropXTo = 0,
    cropYTo = 0,
    cropXFrom = 0,
    cropYFrom = 0,
    assetWidth = 0,
    assetHeight = 0,
    width = 0,
    height = 0,
    container,
  } = attribute;
  const transformCss = `scaleX(${transform.horizontalFlip ? -1 : 1}) scaleY(${
    transform.verticalFlip ? -1 : 1
  })`;
  const realSize = {
    width: Number(container?.id ? container.width : width),
    height: Number(container?.id ? container.height : height),
  };

  function getImgStyle(): CSSProperties {
    const cropXToWidth = cropXTo * assetWidth;
    const cropXToHeight = cropYTo * assetHeight;
    const cropXFromWidth = cropXFrom * assetWidth;
    const cropXFromHeight = cropYFrom * assetHeight;

    const scaleX = attribute.width / (cropXToWidth - cropXFromWidth);
    const scaleY = attribute.height / (cropXToHeight - cropXFromHeight);

    const cropXFromHeightScaleY = cropXFromHeight * scaleY;
    const cropXToWidthScaleX = cropXToWidth * scaleX;
    const cropXToHeightScaleY = cropXToHeight * scaleY;
    const cropXFromWidthScaleX = cropXFromWidth * scaleX;

    const clip = `rect(${cropXFromHeightScaleY}px ${cropXToWidthScaleX}px ${cropXToHeightScaleY}px ${cropXFromWidthScaleX}px)`;
    const imgStyle: CSSProperties = {
      position: 'absolute',
      top: `${-cropXFromHeightScaleY}px`,
      left: `${-cropXFromWidthScaleX}px`,
      width: `${assetWidth * scaleX}px`,
      height: `${assetHeight * scaleY}px`,
      clip,
    };

    if (transform.horizontalFlip || transform.verticalFlip) {
      Object.assign(imgStyle, {
        transform: transformCss,
      });
    }
    return imgStyle;
  }

  function getImgContainer() {
    return {
      width: realSize.width,
      height: realSize.height,
      overflow: 'hidden',
      transformOrigin: '0 0 0',
    };
  }

  function getCanvasStyle() {
    const canvasStyle: CSSProperties = {
      width: realSize.width,
      height: realSize.height,
    };
    if (transform && (transform.horizontalFlip || transform.verticalFlip)) {
      canvasStyle.transform = transformCss;
    }
    return canvasStyle;
  }

  return {
    getImgStyle,
    getCanvasStyle,
    getImgContainer,
  };
}

export function useCanvas() {}
