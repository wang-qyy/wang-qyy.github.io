import React, { CSSProperties, MouseEvent, useRef } from 'react';
import { observer } from 'mobx-react';
import Asset from '@kernel/Asset';
import {
  assetBlur,
  getCurrentTemplateIndex,
  getManualPreview,
  setCurrentTemplate,
  useGetCanvasInfo,
  useGetManualCurrentTime,
  useGetVideoStatus,
  useVideoStatusByPartHandler,
  videoHandler,
} from '@kernel/store';

import {
  useArrowHandler,
  useCanvasStyle,
  useMouseHandler,
} from '@kernel/Canvas/utils';
import { useGetCurrentTimeByCurrentTemplate } from '@kernel/PreviewCanvas/utils';
import { emptyVideoStatus } from '@kernel/PreviewCanvas/WholeTemplate';
import CanvasHandler from '@kernel/Canvas/CanvasHandler';
import Audio from '@kernel/Canvas/MultipleAudio';
import { PlayStatus } from '@kernel/utils/const';
import VideoTimer from './VideoTimer';
import BoxSelection, { BoxSelectionRef } from './BoxSelection';
import TemplateTranstion from './TemplateTranstion';
import { useTranstionStyle } from './TemplateTranstion/hook';
import { TemplateClass } from '../typing';
import { deepCloneJson } from '../utils/single';

const WholeCanvas = observer(() => {
  const canvasInfo = useGetCanvasInfo();
  const { canvasStyle, renderStyle } = useCanvasStyle(canvasInfo);

  const boxSelection = useRef<BoxSelectionRef>(null);
  // 自动播放时间以及状态
  const videoStatusData = useGetVideoStatus();
  // 手动播放状态
  const manualPreview = getManualPreview();
  // 手动播放时间
  const manualCurrentTime = useGetManualCurrentTime();
  const templateIndex = getCurrentTemplateIndex();
  const videoStatusByPartHandler = useVideoStatusByPartHandler();

  const {
    audioList,
    timerVideoInfo,
    currentTemplateIndex,
    videoStatus,
    templateList,
    template,
  } = useGetCurrentTimeByCurrentTemplate(
    videoStatusData,
    videoStatusByPartHandler,
  );

  function clearEditStatus(e: MouseEvent<HTMLDivElement>) {
    assetBlur();
    boxSelection.current?.onMouseDown(e);
  }

  if (templateIndex !== currentTemplateIndex) {
    setCurrentTemplate(currentTemplateIndex);
  }
  useArrowHandler();
  // 鼠标移动
  useMouseHandler();
  const { animationType, style: transtionStyle } = useTranstionStyle(
    videoStatus,
    template,
  );
  // 计算每一个片段的样式
  function calcTemplateStyle(index: number) {
    let style: CSSProperties = {
      zIndex: 100 - index,
      pointerEvents: 'none',
      opacity: 0,
      left: 0,
      top: 0,
      transform: 'translateZ(0px)',
    };
    if (!manualPreview && videoStatus.playStatus !== 1) {
      if (index === currentTemplateIndex) {
        style.opacity = 1;
        style.pointerEvents = 'auto';
      }
      return style;
    }
    if (index === currentTemplateIndex) {
      style = {
        zIndex: 100 + 1,
        ...transtionStyle.style,
      };
    }
    if (animationType === 'after' && index === currentTemplateIndex + 1) {
      style = {
        zIndex: 100 - index,
        ...transtionStyle.lastStyle,
        pointerEvents: 'none',
      };
    }
    if (animationType === 'before' && index === currentTemplateIndex - 1) {
      style = {
        zIndex: 100 - index,
        ...transtionStyle.lastStyle,
        pointerEvents: 'none',
      };
    }
    return style;
  }

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
          <TemplateTranstion />
          {templateList.map((item, index) => {
            let flag = index === currentTemplateIndex;
            let needShow = true;
            if (templateList.length > 15) {
              needShow = flag;
              if (videoStatus.playStatus === PlayStatus.Playing) {
                needShow =
                  flag ||
                  currentTemplateIndex === index + 1 ||
                  currentTemplateIndex === index - 1;
              }
            }

            if (manualCurrentTime) {
              flag = manualCurrentTime.templateIndex === index;
            }
            // 如果这个片段有结束转场 那播放完成之后，画面停留在最后一帧
            let noCurrentVideoStatus = deepCloneJson(emptyVideoStatus);
            if (!flag && index === currentTemplateIndex - 1) {
              if (item?.endTransfer) {
                noCurrentVideoStatus.currentTime =
                  item.videoInfo.allAnimationTime;
                noCurrentVideoStatus.playStatus = 0;
              } else {
                noCurrentVideoStatus = emptyVideoStatus;
              }
            }
            let currentManualPreview = manualPreview;
            const currentManualCurrentTime = manualCurrentTime;
            if (
              !flag &&
              index === currentTemplateIndex - 1 &&
              currentManualCurrentTime
            ) {
              currentManualPreview = true;
              currentManualCurrentTime.currentTime =
                noCurrentVideoStatus.currentTime;
            }
            return needShow ? (
              <Asset
                manualPreview={currentManualPreview}
                manualCurrentTime={currentManualCurrentTime}
                assets={item.assetList}
                whole
                isPreview={false}
                style={calcTemplateStyle(index)}
                templateIndex={index}
                key={`wholeCanvas-${item.id}`}
                prefix={`wholeCanvas-${index}-${item.id}`}
                canvasInfo={canvasInfo}
                videoStatus={flag ? videoStatus : noCurrentVideoStatus}
                videoInfo={item.videoInfo}
                pageAttr={item.pageAttr}
                isTranstionRender={!flag}
              />
            ) : (
              <div />
            );
          })}
        </div>
      </div>
      <Audio
        videoStatus={videoStatusData}
        audioList={audioList}
        templateIndex={currentTemplateIndex}
      />
      <VideoTimer
        endTime={timerVideoInfo.allAnimationTime}
        videoStatus={videoStatusData}
        videoHandler={videoHandler}
      />
      <div
        className="hc-asset-path-container"
        id="hc-path-container"
        style={{ display: 'none' }}
      />
    </div>
  );
});

export default WholeCanvas;
