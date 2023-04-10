import {
  CSSProperties,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AssetClass, CanvasInfo } from '@kernel/typing';

import { useCreation } from 'ahooks';

import { getTextEditAsset } from '@kernel/store';
import { getFontStyle } from '@kernel/utils/assetHelper/font';
import { TextDomHandler } from '@AssetCore/Item/Text/textHelper';

import type { Refs, TextPositionObject } from './components/originText/typing';

/**
 * @description 获取字体body样式
 * @param asset
 */
export function useStyle(asset: AssetClass) {
  const textEditAsset = getTextEditAsset();

  function needHidden(hidden?: boolean): CSSProperties {
    return hidden || textEditAsset === asset ? { opacity: 0 } : {};
  }

  return {
    fontStyle: getFontStyle(asset),
    needHidden,
  };
}

/**
 * @description 构建渲染使用的字体
 * @param asset
 * @param canvasInfo
 */
export function useText(asset: AssetClass, canvasInfo: CanvasInfo) {
  const handler = useCreation<TextDomHandler>(() => new TextDomHandler(), []);
  const [textPosition, setTextPosition] = useState<TextPositionObject>({});
  const { attribute } = asset;
  const {
    text = [],
    writingMode,
    fontSize,
    letterSpacing,
    textAlign,
    width,
    height,
  } = attribute;

  const data = useMemo(() => {
    handler.updateText(text);
    return {
      textInstance: handler.textInstance,
      textHtml: handler.textHtml,
      renderText: handler.renderText,
      textLength: handler.textNumber,
      textRefs: handler.textRefs,
    };
  }, [text]);

  useLayoutEffect(() => {
    if (setTextPosition) {
      setTimeout(() => {
        handler.updateTextPosition();
        setTextPosition(handler.textPosition);
      }, 50);
    }
  }, [text, writingMode, fontSize, letterSpacing, textAlign, width, height]);

  return {
    ...data,
    textPosition,
    textHandler: handler,
  };
}

/**
 * @description 由于字体的宽高由其本身字体性质决定，所以在初始化字体后，自动纠正字体尺寸
 * @param asset
 * @param isPreviewMovie
 */
export function useUpdateTextSizeWhenInit(
  asset: AssetClass,
  isPreviewMovie: boolean,
) {
  const effectFont = useRef<HTMLDivElement>(null);
  const normalFont = useRef<HTMLDivElement>(null);
  const { attribute } = asset;
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
  } = attribute;
  const textEditAsset = getTextEditAsset();

  function updateFontSize() {
    // 成组的文字 不需要自动校正宽高
    if (asset.parent) {
      return;
    }
    if (normalFont.current) {
      const { writingMode, width, height } = asset.attribute;
      const { fontSizeScale } = asset;
      let { offsetHeight, offsetWidth } = normalFont.current;
      offsetHeight *= fontSizeScale;
      offsetWidth *= fontSizeScale;
      // 向上取整
      offsetHeight = Math.ceil(offsetHeight);
      offsetWidth = Math.ceil(offsetWidth);
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

  useLayoutEffect(() => {
    if (isPreviewMovie) {
      return;
    }
    // 当字体处于编辑状态时，不需要自动矫正字体宽高
    if (textEditAsset !== asset && !asset?.tempData?.rt_stopAutoCalc) {
      updateFontSize();
    }
  }, [writingMode, fontFamily, lineHeight, letterSpacing, effect]);

  useLayoutEffect(() => {
    if (isPreviewMovie) {
      return;
    }
    // 由于字体的特殊性，所以在响应字体模式下，只修改对应尺寸，令一边尺寸，由字体自适应调整
    if (
      textEditAsset !== asset &&
      normalFont.current &&
      !attribute?.rt_stopAutoCalc
    ) {
      updateFontSize();
    }
  }, [width, height, fontSize, text, textEditAsset]);
  return {
    effectFont,
    normalFont,
  };
}
