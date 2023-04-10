import React, { forwardRef, ForwardedRef, PropsWithChildren } from 'react';
import ReactDOM from 'react-dom';
import { VideoStatus, Attribute, TemplateVideoInfo } from '@kernel/typing';
import { config } from '@kernel/utils/config';
import Image from '@kernel/Components/Image';

interface HandImgProps {
  videoStatus: VideoStatus;
  videoInfo: TemplateVideoInfo;
  attribute: Attribute;
  AssetRootRef: HTMLDivElement;
}

function HandImgImage(
  props: PropsWithChildren<HandImgProps>,
  ref: ForwardedRef<HTMLImageElement>,
) {
  const { videoStatus, attribute, AssetRootRef } = props;
  const isHidden =
    videoStatus.currentTime < attribute.startTime - 1000 ||
    videoStatus.currentTime > attribute.endTime;

  return ReactDOM.createPortal(
    <Image
      src={config.handImgSrc}
      alt="hand"
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        visibility: !isHidden ? 'visible' : 'hidden',
        zIndex: isHidden ? config.minZIndex : config.maxZIndex,
      }}
      ref={ref}
    />,
    AssetRootRef,
  );
}

const HandImg = forwardRef<HTMLImageElement, HandImgProps>(HandImgImage);

export { HandImg };
