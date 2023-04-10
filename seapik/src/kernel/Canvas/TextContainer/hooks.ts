import React, {
  CSSProperties,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AssetClass } from '@/kernel';
import { useDebounceFn } from 'ahooks';

/**
 * @description 由于字体的宽高由其本身字体性质决定，所以在初始化字体后，自动纠正字体尺寸
 * @param asset
 */
export function useUpdateTextSizeWhenInit(asset: AssetClass) {
  const fontRef = useRef<HTMLDivElement>(null);
  const {
    writingMode,
    fontFamily,
    lineHeight,
    text,
    letterSpacing,
    fontSize,
    effect,
    width,
    height,
  } = asset.attribute;

  function updateFontSize() {
    // 成组的文字 不需要自动校正宽高
    if (asset.parent) {
      return;
    }
    if (fontRef.current) {
      const { writingMode, width, height } = asset.attribute;
      const { fontSizeScale } = asset;
      let { offsetHeight, offsetWidth } = fontRef.current;
      offsetHeight *= fontSizeScale;
      offsetWidth *= fontSizeScale;
      // 向上取整
      offsetHeight = Math.ceil(offsetHeight);
      if (writingMode === 'vertical-rl') {
        if (width !== offsetWidth) {
          asset.update({
            attribute: {
              width: Math.max(offsetWidth, 12),
            },
          });
        }
      } else {
        if (height !== offsetHeight) {
          asset.update({
            attribute: {
              height: Math.max(offsetHeight, 12),
            },
          });
        }
      }
    }
  }

  const { run: updateFontSizeDe } = useDebounceFn(updateFontSize, {
    wait: 100,
  });

  useLayoutEffect(() => {
    updateFontSizeDe();
  }, [writingMode, fontFamily, lineHeight, letterSpacing, effect]);

  useLayoutEffect(() => {
    // 由于字体的特殊性，所以在响应字体模式下，只修改对应尺寸，令一边尺寸，由字体自适应调整
    updateFontSize();
  }, [width, height, fontSize, text]);
  return { fontRef, updateFontSize };
}
