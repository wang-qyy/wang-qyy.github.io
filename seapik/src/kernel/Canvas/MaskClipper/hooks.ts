import { useMemo, useEffect, CSSProperties, useRef } from 'react';
import { useCreation } from 'ahooks';
import { Asset, AssetClass } from '@kernel/typing';
import { getCanvasInfo } from '@/kernel/store';
import { useMaskHandler } from './maskhooks';

export function useGetClipInfo(editAsset: AssetClass) {
  const { attribute, transform } = editAsset;
  const { width, height, crop } = attribute;
  const { posX, posY, rotate = 0 } = transform;
  const { scale } = getCanvasInfo();
  const { vSize, vScale, MaskContainer, clipPath } = useMaskHandler(editAsset);
  const originImageSrc = editAsset.attribute.picUrl;

  const maskPanelStyle: CSSProperties = useCreation(() => {
    return {
      width: width * scale,
      height: height * scale,
      transform: `rotate(${rotate}deg)`,
      position: 'absolute',
      left: `${posX * scale}px`,
      top: `${posY * scale}px`,
      visibility: 'visible',
    };
  }, [width, height, posX, posY, rotate, scale]);

  // 缩放组件样式
  const ScaleStyleTransform: CSSProperties = useCreation(() => {
    return {
      width: width * scale,
      height: height * scale,
      position: 'absolute',
      left: 0,
      top: 0,
    };
  }, [width, height, scale]);
  // 缩放组件样式
  const ScaleStyleTransformOrigin: CSSProperties = useCreation(() => {
    if (crop) {
      const { size } = crop;
      return {
        width: size.width * scale,
        height: size.height * scale,
        position: 'absolute',
        left: 0,
        top: 0,
      };
    }
    return {};
  }, [
    crop?.position.x,
    crop?.position.y,
    crop?.size.height,
    crop?.size.width,
    vScale,
    scale,
  ]);
  // 原图样式
  const originStyle: CSSProperties = useCreation(() => {
    if (crop) {
      const { size, position } = crop;
      return {
        left: position.x * scale,
        top: position.y * scale,
        width: size.width * scale,
        height: size.height * scale,
        position: 'absolute',
        transform: `rotate(${rotate}deg)`,
      };
    }

    return {};
  }, [crop, vScale, scale, rotate]);
  // 原图图片样式
  const originStylePic: CSSProperties = useCreation(() => {
    if (crop) {
      const { size, position } = crop;
      if (rotate) {
        return {
          left: position.x * scale - posX * scale,
          top: position.y * scale - posY * scale,
          width: size.width * scale,
          height: size.height * scale,
          position: 'absolute',
        };
      }
      return {
        left: position.x * scale - posX * scale,
        top: position.y * scale - posY * scale,
        width: size.width * scale,
        height: size.height * scale,
        position: 'absolute',
      };
    }
    return {};
  }, [crop, vScale, scale]);
  return {
    ScaleStyleTransform,
    ScaleStyleTransformOrigin,
    maskPanelStyle,
    originStyle,
    originStylePic,
    originImageSrc,
    vSize,
    vScale,
    MaskContainer,
    clipPath,
  };
}
