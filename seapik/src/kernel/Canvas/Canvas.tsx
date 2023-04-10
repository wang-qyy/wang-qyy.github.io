import React, { MouseEvent, useRef } from 'react';
import { observer } from 'mobx-react';
import Asset from '@kernel/Asset';
import {
  useGetCanvasInfo,
  useGetVideoStatus,
  videoHandler,
  getCurrentTemplateIndex,
  getTemplateVideoInfo,
  assetBlur,
  getCurrentTemplate,
  getAudioList,
  getManualPreview,
} from '@kernel/store';

import { useArrowHandler, useCanvasStyle } from '@kernel/Canvas/utils';
import CanvasHandler from '@kernel/Canvas/CanvasHandler';
import { toJS } from 'mobx';
import VideoTimer from './VideoTimer';
import BoxSelection, { BoxSelectionRef } from './BoxSelection';
import { AudioWithTimeScale } from './MultipleAudio';

const Canvas = observer(() => {
  const canvasInfo = useGetCanvasInfo();
  const { canvasStyle, renderStyle } = useCanvasStyle(canvasInfo);
  const boxSelection = useRef<BoxSelectionRef>(null);

  const audioList = getAudioList();
  const TemplateVideoInfo = getTemplateVideoInfo();
  const template = getCurrentTemplate();
  const videoStatus = useGetVideoStatus();
  const templateIndex = getCurrentTemplateIndex();
  const manualPreview = getManualPreview();
  function clearEditStatus(e: MouseEvent<HTMLDivElement>) {
    assetBlur();
    boxSelection.current?.onMouseDown(e);
  }
  useArrowHandler();
  return (
    <div className="hc-core-wrapper" onMouseDown={clearEditStatus}>
      <BoxSelection ref={boxSelection} />
      <div
        className="hc-core-canvas"
        id="HC-CORE-EDITOR-CANVAS"
        style={canvasStyle}
      >
        <CanvasHandler />
        <div className="hc-core-canvas-render" style={renderStyle}>
          <Asset
            manualPreview={manualPreview}
            templateIndex={templateIndex}
            assets={template.assetList}
            isPreview={false}
            prefix="canvas"
            videoInfo={TemplateVideoInfo}
            canvasInfo={canvasInfo}
            videoStatus={videoStatus}
            pageAttr={template.pageAttr}
          />
        </div>
      </div>

      <AudioWithTimeScale
        videoStatus={videoStatus}
        audioList={audioList}
        templateIndex={templateIndex}
      />
      <VideoTimer
        endTime={TemplateVideoInfo.allAnimationTimeBySpeed}
        videoStatus={videoStatus}
        videoHandler={videoHandler}
      />
    </div>
  );
});

export default Canvas;
