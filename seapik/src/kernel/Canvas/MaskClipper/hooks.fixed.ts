import { useMemo, useEffect, CSSProperties, useRef } from 'react';
import { useCreation } from 'ahooks';
import { Asset, AssetClass } from '@kernel/typing';
import { getCanvasInfo } from '@/kernel/store';
import { useMaskHandler } from './maskhooks';

// export function useGetClipInfo(editAsset: AssetClass) {
//   const { assets = [], attribute, transform } = editAsset;
//   const { width, height } = attribute;
//   const { posX, posY, rotate = 0 } = transform;
//   const { scale } = getCanvasInfo();
//   const { vSize, vScale, MaskContainer, clipPath } = useMaskHandler(editAsset);
//   const originImageSrc = useMemo(() => {
//     if (assets.length > 0) {
//       let url = '';
//       switch (assets[0]?.meta.type) {
//         case 'image': {
//           url = assets[0]?.attribute.picUrl || '';
//           break;
//         }
//       }
//       return url;
//     }
//   }, [
//     assets[0].transform.posX,
//     assets[0].transform.posY,
//     assets[0].attribute.width,
//     assets[0].attribute.height,
//   ]);
//   const maskPanelStyle: CSSProperties = useCreation(() => {
//     return {
//       width: width * scale,
//       height: height * scale,
//       transform: `rotate(${rotate}deg)`,
//       position: 'absolute',
//       left: `${posX * scale}px`,
//       top: `${posY * scale}px`,
//       visibility: 'visible',
//     };
//   }, [width, height, posX, posY, rotate, scale]);
//   // 缩放组件样式
//   const ScaleStyleTransform: CSSProperties = useCreation(() => {
//     return {
//       width: width * scale,
//       height: height * scale,
//       position: 'absolute',
//       left: 0,
//       top: 0,
//     };
//   }, [width, height, scale]);
//   // 缩放组件样式
//   const ScaleStyleTransformOrigin: CSSProperties = useCreation(() => {
//     const { attribute: cAttribute } = assets[0];
//     return {
//       width: cAttribute.width * scale,
//       height: cAttribute.height * scale,
//       position: 'absolute',
//       left: 0,
//       top: 0,
//     };
//   }, [
//     assets[0].transform.posX,
//     assets[0].transform.posY,
//     assets[0].attribute.width,
//     assets[0].attribute.height,
//     vScale,
//     scale,
//   ]);
//   // 原图样式
//   const originStyle: CSSProperties = useCreation(() => {
//     const { attribute: cAttribute, transform: cTransform } = assets[0];
//     return {
//       left: cTransform.posX * scale,
//       top: cTransform.posY * scale,
//       width: cAttribute.width * scale,
//       height: cAttribute.height * scale,
//       position: 'absolute',
//       transform: `rotate(${rotate}deg)`,
//     };
//   }, [
//     assets[0].transform.posX,
//     assets[0].transform.posY,
//     assets[0].attribute.width,
//     assets[0].attribute.height,
//     vScale,
//     scale,
//     rotate,
//   ]);
//   // 原图图片样式
//   const originStylePic: CSSProperties = useCreation(() => {
//     const { attribute: cAttribute, transform: cTransform } = assets[0];
//     if (rotate) {
//       return {
//         left: cTransform.posX * scale - posX * scale,
//         top: cTransform.posY * scale - posY * scale,
//         width: cAttribute.width * scale,
//         height: cAttribute.height * scale,
//         position: 'absolute',
//       };
//     }
//     return {
//       left: cTransform.posX * scale - posX * scale,
//       top: cTransform.posY * scale - posY * scale,
//       width: cAttribute.width * scale,
//       height: cAttribute.height * scale,
//       position: 'absolute',
//     };
//   }, [
//     assets[0].transform.posX,
//     assets[0].transform.posY,
//     assets[0].attribute.width,
//     assets[0].attribute.height,
//     vScale,
//     scale,
//   ]);
//   return {
//     ScaleStyleTransform,
//     ScaleStyleTransformOrigin,
//     maskPanelStyle,
//     originStyle,
//     originStylePic,
//     originImageSrc,
//     vSize,
//     vScale,
//     MaskContainer,
//     clipPath,
//   };
// }

export function useGetClipInfo(editAsset: AssetClass) {
  const { assets = [], attribute, transform } = editAsset;
  const { width, height } = attribute;
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
    const { attribute: cAttribute } = assets[0];
    return {
      width: cAttribute.width * scale,
      height: cAttribute.height * scale,
      position: 'absolute',
      left: 0,
      top: 0,
    };
  }, [
    assets[0].transform.posX,
    assets[0].transform.posY,
    assets[0].attribute.width,
    assets[0].attribute.height,
    vScale,
    scale,
  ]);
  // 原图样式
  const originStyle: CSSProperties = useCreation(() => {
    const { attribute: cAttribute, transform: cTransform } = assets[0];
    return {
      left: cTransform.posX * scale,
      top: cTransform.posY * scale,
      width: cAttribute.width * scale,
      height: cAttribute.height * scale,
      position: 'absolute',
      transform: `rotate(${rotate}deg)`,
    };
  }, [
    assets[0].transform.posX,
    assets[0].transform.posY,
    assets[0].attribute.width,
    assets[0].attribute.height,
    vScale,
    scale,
    rotate,
  ]);
  // 原图图片样式
  const originStylePic: CSSProperties = useCreation(() => {
    const { attribute: cAttribute, transform: cTransform } = assets[0];
    if (rotate) {
      return {
        left: cTransform.posX * scale - posX * scale,
        top: cTransform.posY * scale - posY * scale,
        width: cAttribute.width * scale,
        height: cAttribute.height * scale,
        position: 'absolute',
      };
    }
    return {
      left: cTransform.posX * scale - posX * scale,
      top: cTransform.posY * scale - posY * scale,
      width: cAttribute.width * scale,
      height: cAttribute.height * scale,
      position: 'absolute',
    };
  }, [
    assets[0].transform.posX,
    assets[0].transform.posY,
    assets[0].attribute.width,
    assets[0].attribute.height,
    vScale,
    scale,
  ]);
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
