import Asset from '@kernel/Asset';
import React, { CSSProperties, useEffect, useMemo } from 'react';
import VideoTimer from '@kernel/Canvas/VideoTimer';
import Audio from '@kernel/Canvas/MultipleAudio';
import { observer } from 'mobx-react';
import {
  useGetPreviewVideoStatus,
  usePreviewVideoHandler,
} from '@kernel/store/global/adapter';
import { clearPreviewStatus } from '@kernel/storeAPI/Global';
import { PreviewVideoStatusHandler } from '@kernel/PreviewCanvas/store';

import { useGetCurrentTimeByCurrentTemplate } from '@kernel/PreviewCanvas/utils';
import { newDomId } from '@kernel/utils/idCreator';
import { PlayStatus } from '@kernel/utils/const';
import { CanvasInfo } from '@kernel/typing';
import { useCanvasStyle } from '@kernel/Canvas/utils';
import { useTranstionStyle } from '../Canvas/TemplateTranstion/hook';
import { deepCloneJson } from '../utils/single';

export const emptyVideoInfo = {
  startTime: 0,
  endTime: 0,
  allAnimationTime: 0,
};
export const emptyVideoStatus = {
  playStatus: PlayStatus.Stopped,
  currentTime: 0,
};
const WholeTemplate = observer(({ canvasInfo }: { canvasInfo: CanvasInfo }) => {
  const { canvasStyle, renderStyle } = useCanvasStyle(canvasInfo);
  const previewVideoStatus = useGetPreviewVideoStatus();

  const prefix = useMemo(() => {
    return `WholeTemplate-${newDomId()}`;
  }, []);

  const {
    audioList,
    timerVideoInfo,
    currentTemplateIndex,
    videoStatus,
    resetVideoStatus,
    templateList,
    template,
  } = useGetCurrentTimeByCurrentTemplate(
    previewVideoStatus,
    PreviewVideoStatusHandler,
  );

  // 销毁后，自动清楚预览状态
  useEffect(() => {
    return () => {
      clearPreviewStatus();
      resetVideoStatus();
    };
  }, []);
  // const template = templateList[currentTemplateIndex];
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
    };
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
    <div className="hc-core-wrapper">
      <div className="hc-core-canvas" style={canvasStyle}>
        <div className="hc-core-canvas-render" style={renderStyle}>
          {templateList.map((item, index) => {
            const flag = index === currentTemplateIndex;
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
            return needShow ? (
              <Asset
                assets={item.assets}
                isPreview
                style={calcTemplateStyle(index)}
                templateIndex={index}
                key={`wholeTemplate-${item.id}`}
                prefix={`${prefix}-${index}-${item.id}`}
                canvasInfo={canvasInfo}
                videoStatus={flag ? videoStatus : noCurrentVideoStatus}
                videoInfo={item.videoInfo}
                pageAttr={item.pageAttr}
              />
            ) : (
              <></>
            );
          })}
        </div>
      </div>
      <Audio
        videoStatus={previewVideoStatus}
        audioList={audioList}
        templateIndex={currentTemplateIndex}
      />
      <VideoTimer
        endTime={timerVideoInfo.allAnimationTime}
        videoStatus={previewVideoStatus}
        videoHandler={usePreviewVideoHandler}
      />
    </div>
  );
});
export default WholeTemplate;
