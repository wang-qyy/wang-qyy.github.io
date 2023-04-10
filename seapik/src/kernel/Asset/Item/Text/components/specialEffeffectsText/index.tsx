import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { AssetItemProps } from '@kernel/typing';
import { RGBAToStringByOpacity } from '@kernel/utils/single';
import { useUpdateEffect } from 'ahooks';
import { useFontFamilyLoaded } from '@kernel/store';
import {
  getFontContainerStyle,
  getFontStyle,
} from '@kernel/utils/assetHelper/font';
import { toJS } from 'mobx';
import useNewPsd from './hooksPerf';
import { useStyle, useText, useUpdateTextSizeWhenInit } from '../../hooks';
import { useTextScaleStyle } from './hooks';

export interface SpecialTextProps {
  asset: AssetItemProps['asset'];
  canvasInfo: AssetItemProps['canvasInfo'];
  isPreviewMovie: AssetItemProps['isPreviewMovie'];
}

const SpecialText = (props: SpecialTextProps) => {
  const { asset, canvasInfo, isPreviewMovie } = props;
  const { normalFont } = useUpdateTextSizeWhenInit(asset, isPreviewMovie);
  const { scale } = canvasInfo;
  const { attribute, tempData = {} } = asset;
  const { rt_itemScale = 1 } = tempData;
  const { textBackground } = attribute;
  const fontLoaded = useFontFamilyLoaded(attribute.fontFamily);
  const { needHidden } = useStyle(asset);
  const { textHtml } = useText(asset, canvasInfo);
  const fontStyleResult = getFontStyle(asset);
  const canvasRef = useRef(null);
  const mockData = asset.attribute.effectColorful?.effect;
  const { initNewPsd, changeNewPsdFontAttr } = useNewPsd();
  const containerStyle = getFontContainerStyle(asset);
  // rt_itemScale 缩放样式
  const { style: scaleStyle } = useTextScaleStyle(asset);
  // 画布真实宽高
  const { width: canvasWidth, height: canvasHeight } = attribute;
  // 字体信息
  const { color, transform, transformOrigin, width, height, ...other } =
    fontStyleResult;
  useEffect(() => {
    if (mockData) {
      const fontInfo = {
        ...other,
        text: textHtml,
        width: canvasWidth,
        height: canvasHeight,
        scale: asset.fontSizeScale,
      };
      // @ts-ignore
      initNewPsd(mockData, canvasRef.current, fontInfo);
    }
  }, [attribute?.effectColorful]);
  useUpdateEffect(() => {
    if (mockData && rt_itemScale === 1 && !isPreviewMovie) {
      changeNewPsdFontAttr({
        ...other,
        text: textHtml,
        width: canvasWidth,
        height: canvasHeight,
        scale: asset.fontSizeScale,
      });
    }
  }, [
    attribute?.text,
    attribute?.lineHeight,
    attribute.letterSpacing,
    attribute.textAlign,
    attribute.writingMode,
    attribute.width,
    attribute.height,
    attribute.fontStyle,
    attribute?.textDecoration,
    attribute.fontWeight,
    attribute.fontFamily,
    attribute.fontSize,
    rt_itemScale,
    fontLoaded,
  ]);
  return (
    <div
      style={{
        ...needHidden(),
        ...scaleStyle,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <div
        ref={normalFont}
        style={{
          width: containerStyle.width,
          height: 'auto',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: -10,
          fontSize: 100,
        }}
        className="hc-unVisibility"
        dangerouslySetInnerHTML={{ __html: textHtml }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          background: textBackground?.enabled
            ? RGBAToStringByOpacity(
                textBackground?.color,
                textBackground?.opacity / 100,
              )
            : '',
          borderRadius: textBackground?.enabled
            ? textBackground?.borderRadius * scale
            : '',
        }}
      />
    </div>
  );
};
export default observer(SpecialText);
