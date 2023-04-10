import { Transform, Attribute } from '@kernel/typing';
import { CSSProperties } from 'react';
import assetHandler from '@kernel/store/assetHandler';
import {
  buildAttribute,
  buildTransform,
} from '@kernel/store/assetHandler/utils';
import {
  useUpdateWatermarkAttributeFactory,
  useUpdateWatermarkTransformFactory,
} from '@kernel/storeAPI/Asset/utils';
import { assetUpdater } from '@/kernel';

export function useWatermarkTextByObserver() {
  return useUpdateWatermarkAttributeFactory<Attribute['text']>('text');
}

export function useWatermarkColorByObserver() {
  return useUpdateWatermarkAttributeFactory<Attribute['color']>('color');
}

export function useWatermarkFontFamilyByObserver() {
  return useUpdateWatermarkAttributeFactory<Attribute['fontFamily']>(
    'fontFamily',
  );
}

export function useWatermarkFontSizeByObserver() {
  return useUpdateWatermarkAttributeFactory<Attribute['fontSize']>('fontSize');
}

export function useWatermarkImgUrlByObserver() {
  return useUpdateWatermarkAttributeFactory<Attribute['picUrl']>('picUrl');
}

export function useWatermarkOpacityByObserver() {
  return useUpdateWatermarkTransformFactory<Transform['alpha']>('alpha');
}

export function useWatermarkImgSizeByObserver() {
  const { width, height } = assetHandler.watermark?.attribute || {};
  const value = { width, height };

  function update({ height, width }: { height: number; width: number }) {
    if (assetHandler.watermark) {
      assetUpdater(assetHandler.watermark, buildAttribute({ height, width }));
    }
  }

  return [value, update];
}

interface WatermarkPositionParams {
  posX: number;
  posY: number;
  textAlign?: CSSProperties['textAlign'];
}

// 设置位置
export function useSetWatermarkPositionByObserver() {
  const value = {
    textAlign: assetHandler.watermark?.attribute.textAlign,
    posX: assetHandler.watermark?.transform.posX,
    posY: assetHandler.watermark?.transform.posY,
  };

  function update({ posX, posY, textAlign }: WatermarkPositionParams) {
    if (assetHandler.watermark)
      assetUpdater(assetHandler.watermark, {
        attribute: {
          textAlign,
        },
        transform: {
          posX,
          posY,
        },
      });
  }

  return [value, update];
}

export function getTemplateWatermark() {
  return assetHandler.watermark;
}
