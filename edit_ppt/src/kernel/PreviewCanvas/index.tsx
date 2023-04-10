import React from 'react';
import { observer } from 'mobx-react';
import SingleTemplate from '@kernel/PreviewCanvas/SingleTemplate';
import WholeTemplate from '@kernel/PreviewCanvas/WholeTemplate';
import { CanvasInfo } from '../typing';
import { formatCanvasInfoScale } from '../storeAPI';

const PreviewCanvas = observer(
  ({
    canvasInfo,
    templateId,
    previewWhole = true,
  }: {
    canvasInfo: CanvasInfo;
    templateId?: string;
    previewWhole?: boolean;
  }) => {
    // 格式化画布的缩放值
    canvasInfo = formatCanvasInfoScale(canvasInfo);
    return previewWhole ? (
      <WholeTemplate canvasInfo={canvasInfo} />
    ) : (
      <SingleTemplate canvasInfo={canvasInfo} templateId={templateId} />
    );
  },
);
export default PreviewCanvas;
