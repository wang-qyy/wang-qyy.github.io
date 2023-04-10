import React, { useRef, CSSProperties, useMemo } from 'react';
import { observer } from 'mobx-react';
import { AssetItemProps } from '@kernel/typing';
import { PlayStatus } from '@kernel/utils/const';
import { RGBAToStringByOpacity } from '@/kernel/utils/single';
import { getFontContainerStyle } from '@kernel/utils/assetHelper/font';
import { DEFAULT_FONT_SIZE } from '@/kernel/utils/assetHelper/const';
import { canSetTextAnimation } from '@/kernel';
import {
  useStyle,
  useText,
  useAnimationData,
  useAnimation,
  useUpdateTextSizeWhenInit,
} from '../../hooks';
import { buildStyle } from './utils';
import { HandImg } from '../../components';
import useTextFormatter from './hook';

const baseTextStyle: CSSProperties = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  left: 0,
  top: 0,
  transformOrigin: '0 0 0',
};

export default observer((props: AssetItemProps) => {
  const {
    asset,
    showOnly,
    videoInfo,
    videoStatus,
    isPreviewMovie = false,
    manualPreview = false,
    AssetRootRef,
    canvasInfo,
  } = props;

  const handImg = useRef<HTMLImageElement>(null);
  const specificWordAreaRef = useRef<HTMLImageElement>(null);

  const { attribute, fontSizeScale } = asset;
  const { textBackground, width, height } = attribute;
  const { layers, assetkey } = useTextFormatter(asset, isPreviewMovie);
  // const { layers = [] } = effectVariant ?? {};
  const { fontStyle: fontStyleResult, needHidden } = useStyle(asset);
  const { normalFont } = useUpdateTextSizeWhenInit(asset, isPreviewMovie);
  const { textHtml, renderText, textHandler } = useText(asset, canvasInfo);
  const { getAnimationParams, mockTime } = useAnimationData(props, textHandler);

  const { renderTextByPosition, getAnimationStatus } = useAnimation(
    asset,
    getAnimationParams,
    handImg,
  );

  const isPlaying = useMemo(() => {
    return videoStatus.playStatus === PlayStatus.Playing;
  }, [videoStatus.playStatus]);

  const {
    isTextAnimationIng,
    showWriteTextImg,
    isWriteTextImgOut,
    enterTypeId,
    isTextAnimation,
    isOverHiddenAnimaiton,
  } = getAnimationStatus();

  const showHandImg = enterTypeId === 5 && !showOnly;
  let showAnimation = false;

  if (!showOnly && mockTime > 0) {
    showAnimation = true;
  } else {
    showAnimation =
      (isTextAnimationIng || (showWriteTextImg && !isWriteTextImgOut)) &&
      (isPlaying || manualPreview || isPreviewMovie) &&
      !showOnly &&
      canSetTextAnimation(asset);
  }

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
  return (
    <div
      className="assetTextEditor"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <div
        className="specificWordArea"
        ref={specificWordAreaRef}
        style={{
          ...fontStyleResult,
          ...needHidden(),
          ...getFontContainerStyle(asset),
          // visibility: showAnimation ? 'hidden' : 'visible',
          background: textBackground?.enabled
            ? RGBAToStringByOpacity(
                textBackground?.color,
                textBackground?.opacity / 100,
              )
            : '',
          borderRadius: textBackground?.enabled
            ? `${textBackground?.borderRadius}px`
            : '',
          overflowY:
            showAnimation && isOverHiddenAnimaiton ? 'hidden' : 'unset',
        }}
      >
        <div
          ref={normalFont}
          style={{ position: 'absolute', left: 0, top: 0 }}
          className="hc-unVisibility"
          dangerouslySetInnerHTML={{ __html: textHtml }}
        />
        {layers.length > 0 ? (
          layers.map((item: any, index) => {
            const bodyStyle = buildStyle(item, DEFAULT_FONT_SIZE);

            const aniStyle: CSSProperties = {
              ...bodyStyle,
              ...baseTextStyle,
            };

            return (
              <div
                className="specificLayer"
                key={`specificLayer-${index}-${assetkey}`}
                style={{
                  ...bodyStyle,
                  transformOrigin: '0 0 0',
                }}
              >
                <div className="specificLayerContent">
                  <div
                    style={{
                      ...bodyStyle,
                      ...baseTextStyle,
                      ...moduleStyle,
                      visibility: !isTextAnimation ? 'visible' : 'hidden',
                    }}
                    dangerouslySetInnerHTML={{ __html: textHtml }}
                  />
                  <div
                    style={{
                      ...aniStyle,
                      ...baseTextStyle,
                      ...moduleStyle,
                      visibility:
                        isTextAnimation && !showAnimation
                          ? 'visible'
                          : 'hidden',
                      width: width / fontSizeScale,
                      height: height / fontSizeScale,
                    }}
                  >
                    {renderText}
                  </div>
                  {showAnimation && (
                    <div
                      style={{
                        ...aniStyle,
                        ...baseTextStyle,
                        visibility: showAnimation ? 'visible' : 'hidden',
                      }}
                      className="additional_text_animation"
                    >
                      <div
                        style={{
                          ...bodyStyle,
                          ...baseTextStyle,
                          ...moduleStyle,
                          visibility: showAnimation ? 'visible' : 'hidden',
                        }}
                      >
                        {renderTextByPosition(isPlaying, isPreviewMovie)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <>
            <div
              style={{
                visibility: !isTextAnimation ? 'visible' : 'hidden',
                ...moduleStyle,
              }}
              dangerouslySetInnerHTML={{ __html: textHtml }}
            />
            <div
              style={{
                ...baseTextStyle,
                display: 'inline-block',
                visibility:
                  isTextAnimation && !showAnimation ? 'visible' : 'hidden',
                width: width / fontSizeScale,
                height: height / fontSizeScale,
              }}
            >
              {renderText}
            </div>
            {isTextAnimation && (
              <div
                style={{
                  ...baseTextStyle,
                  ...moduleStyle,
                  visibility: showAnimation ? 'visible' : 'hidden',
                }}
                className="additional_text_animation"
              >
                {!showOnly &&
                  isTextAnimation &&
                  renderTextByPosition(isPlaying, isPreviewMovie)}
              </div>
            )}
          </>
        )}
      </div>

      {showHandImg && AssetRootRef.current && (
        <HandImg
          ref={handImg}
          videoInfo={videoInfo}
          videoStatus={videoStatus}
          attribute={attribute}
          AssetRootRef={AssetRootRef.current}
        />
      )}
    </div>
  );
});
