import React, { PropsWithChildren, useMemo, useState } from 'react';
import { Popover, Spin } from 'antd';

import Lottie from '@/components/Lottie';

import './index.less';
import { AssetType } from '@hc/editor-core';

export default function Preview(
  props: PropsWithChildren<{
    type: AssetType;
    src: string;
    poster?: string;
    previewNode?: React.ReactNode;
  }>,
) {
  const { children, src, type, poster, previewNode } = props;
  const [previewLoaded, setPreviewLoaded] = useState(
    ['lottie', 'effect'].includes(type) || false,
  );

  const preview = useMemo(() => {
    if (previewNode) return previewNode;
    switch (type) {
      case 'image':
      case 'pic':
      case 'SVG':
        return (
          <img src={src} alt="img" onLoad={() => setPreviewLoaded(true)} />
        );

      case 'video':
      case 'videoE':
        return (
          <video
            autoPlay
            src={src}
            onCanPlayCapture={() => setPreviewLoaded(true)}
          />
        );

      case 'lottie':
        return <Lottie autoPlay alwaysPlay path={src} preview={poster} />;

      default:
        return <></>;
    }
  }, [type]);

  return (
    <Popover
      //   trigger="click"
      placement="rightBottom"
      overlayClassName="materialItemPopover"
      destroyTooltipOnHide
      content={<Spin spinning={!previewLoaded}>{preview}</Spin>}
    >
      {children}
    </Popover>
  );
}
