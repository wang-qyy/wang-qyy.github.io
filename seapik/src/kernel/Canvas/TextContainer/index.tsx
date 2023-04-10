import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useImperativeHandle,
  forwardRef,
  CSSProperties,
  useMemo,
} from 'react';
import { observer } from 'mobx-react';
import { useSize, useUpdateEffect } from 'ahooks';
import { Asset, AssetBaseSize, AssetClass } from '@kernel/typing';
import { getTextEditAsset, assetUpdater, getCanvasInfo } from '@kernel/store';
import './index.less';
import {
  formatTextForAssetAttr,
  getFontContainerStyle,
  getFontStyle,
} from '@kernel/utils/assetHelper/font';
import { useUpdateTextSizeWhenInit } from '@kernel/Canvas/TextContainer/hooks';

export interface TextContainerProps {
  asset: AssetClass;
  text?: string[];
}

function TextContainer({ asset, text }: TextContainerProps) {
  const { scale } = getCanvasInfo();
  const currentText = formatTextForAssetAttr(
    (text ?? asset?.attribute?.text) || [],
  );
  const { fontRef, updateFontSize } = useUpdateTextSizeWhenInit(asset);
  useUpdateEffect(() => {
    if (text && text.toString() !== '') {
      updateFontSize();
    }
  }, [text]);
  return (
    <div
      className="text-container"
      style={{
        ...asset.containerSize,
        transformOrigin: '0 0 0',
        transform: `scale(${scale})`,
      }}
    >
      <div style={getFontContainerStyle(asset)}>
        <div
          ref={fontRef}
          className="text-container-inner"
          style={getFontStyle(asset)}
          dangerouslySetInnerHTML={{ __html: currentText }}
        />
      </div>
    </div>
  );
}
function TextContainerWrap(props: TextContainerProps) {
  const textEditAsset = getTextEditAsset();
  if (textEditAsset) {
    return null;
  }
  return <TextContainer {...props} />;
}

export default observer(TextContainerWrap);
