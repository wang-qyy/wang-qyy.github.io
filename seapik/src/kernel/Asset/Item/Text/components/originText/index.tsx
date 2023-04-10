import { useRef, CSSProperties, useMemo } from 'react';
import { observer } from 'mobx-react';
import { AssetItemProps } from '@kernel/typing';
import { getFontContainerStyle } from '@kernel/utils/assetHelper/font';
import { useStyle, useText, useUpdateTextSizeWhenInit } from '../../hooks';
import { RGBAToString } from '@kernel/utils/single';

export default observer((props: AssetItemProps) => {
  const { asset, canvasInfo, isPreviewMovie = false } = props;

  const { attribute, fontSizeScale } = asset;
  const { textBackground, width, height } = attribute;
  const { fontStyle: fontStyleResult, needHidden } = useStyle(asset);
  const { textHtml, renderText, textHandler } = useText(asset, canvasInfo);
  const { normalFont } = useUpdateTextSizeWhenInit(asset, isPreviewMovie);

  const moduleStyle: CSSProperties = useMemo(() => {
    if (asset?.parent) {
      return {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: attribute?.textAlign,
      };
    }
    return {};
  }, [asset?.parent, attribute?.textAlign]);

  const style: CSSProperties = {
    ...fontStyleResult,
    ...needHidden(),
    ...getFontContainerStyle(asset),
    // backgroundColor: textBackground?.enabled
    //   ? RGBAToStringByOpacity(
    //       textBackground?.color,
    //       textBackground?.opacity / 100,
    //     )
    //   : '',
    borderRadius: textBackground?.enabled
      ? `${textBackground?.borderRadius}px`
      : '',
    overflowY: 'unset',
  };

  const textOutline = attribute.outline
    ? {
        WebkitTextStroke: `${attribute.outline.width}px ${RGBAToString(
          attribute.outline.color,
        )}`,
      }
    : {};

  return (
    <div
      // className="text-asset-render"
      aria-label="text-asset-render"
      style={style}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          ...moduleStyle,
          ...textOutline,
        }}
        dangerouslySetInnerHTML={{ __html: textHtml }}
      />
      <div
        ref={normalFont}
        style={{ ...moduleStyle }}
        dangerouslySetInnerHTML={{ __html: textHtml }}
      />
    </div>
  );
});
