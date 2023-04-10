import { CSSProperties, useMemo } from 'react';
import { sortBy } from 'lodash-es';

import { RGBAToString, transferGradientToString } from '@kernel/utils/single';
import { AssetClass, CanvasInfo, PageAttr } from '@kernel/typing';
import { getTemplateBackgroundByPageAttr } from '@kernel/PreviewCanvas/utils';
import { backupFontFamily } from '@kernel/utils/defaultConfig';
import AssetItemState from '../store/assetHandler/asset';

export function useCanvasBackground(
  canvasInfo: CanvasInfo,
  pageAttr?: PageAttr,
) {
  const { width, scale, height } = canvasInfo;
  const background = useMemo(() => {
    return getTemplateBackgroundByPageAttr(pageAttr);
  }, [pageAttr?.backgroundImage, pageAttr?.backgroundColor]);

  return useMemo(() => {
    const style: CSSProperties = {
      width,
      height,
    };
    if (background) {
      if (
        background?.backgroundImage?.resId &&
        background?.backgroundImage?.rt_imageUrl
      ) {
        const { width = 0, height = 0 } =
          background?.backgroundImage?.backgroundSize ?? {};
        Object.assign(style, {
          background: `url(${background?.backgroundImage?.rt_imageUrl}) center center / ${width}px ${height}px no-repeat`,
        });
      } else if (background.backgroundColor) {
        if (!background.backgroundColor?.type) {
          Object.assign(style, {
            background: RGBAToString(background.backgroundColor),
          });
        } else {
          Object.assign(style, {
            background: transferGradientToString(background.backgroundColor),
          });
        }
      }
    }
    return style;
  }, [background, width, scale, height]);
}

export function getFontStyleAsset(asset: AssetClass): CSSProperties {
  const { attribute, fontFamily } = asset;

  const fontColor = attribute.color && RGBAToString(attribute.color);

  let fontFamilyString = fontFamily || '';
  if (backupFontFamily) {
    fontFamilyString += `, ${backupFontFamily}`;
  }
  const style: CSSProperties = {
    fontSize: attribute.fontSize,
    width: attribute.width ?? 0,
    height: attribute.height ?? 0,
    fontStyle: attribute.fontStyle,
    textDecoration: attribute?.textDecoration,
    fontFamily: fontFamilyString,
    lineHeight: (attribute?.lineHeight ?? 0) / 10,
    letterSpacing: attribute.letterSpacing,
    color: fontColor,
    wordBreak: 'break-all',
    textAlign: attribute.textAlign,
    writingMode: attribute.writingMode
      ? attribute.writingMode
      : 'horizontal-tb',
  };
  if (attribute.fontWeight === 'bold') {
    if (
      attribute?.effectVariant?.layers &&
      attribute?.effectVariant?.layers.length > 0
    ) {
      Object.assign(style, {
        fontWeight: 'bold',
      });
    } else {
      Object.assign(style, {
        WebkitTextStroke: `1px ${fontColor}`,
      });
    }
  }

  return style;
}

export interface EffectAsset {
  assetList: EffectAsset[];
  isEffect: true;
  asset: AssetItemState;
}

export const formatEffectAssets = (assets: AssetItemState[]) => {
  const newAssets: Array<AssetItemState | EffectAsset> = [];
  let current = newAssets;
  sortBy(assets, (o) => -o.transform.zindex).forEach((asset) => {
    const {
      meta: { type },
    } = asset;
    // 特效层
    if (type === 'effect') {
      const effectAsset: EffectAsset = {
        asset,
        isEffect: true,
        assetList: [],
      };
      current.push(effectAsset);
      current = effectAsset.assetList;
      return;
    }
    current.push(asset);
  });
  return newAssets;
};
