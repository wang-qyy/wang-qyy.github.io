import Asset from '@kernel/Asset';
import React, { useEffect, useMemo } from 'react';
import VideoTimer from '@kernel/Canvas/VideoTimer';
import { observer } from 'mobx-react';
import { clearPreviewStatus } from '@kernel/storeAPI/Global';
import {
  usePreviewVideoHandler,
  useGetPreviewVideoStatus,
} from '@kernel/store/global/adapter';
import { getAudioList } from '@kernel/store/audioHandler/adapter';
import { getTemplate } from '@kernel/store/assetHandler/adapter';
import { AudioWithTimeScale } from '@kernel/Canvas/MultipleAudio';
import { newDomId } from '@kernel/utils/idCreator';
import { useCanvasStyle } from '@kernel/Canvas/utils';
import { CanvasInfo, TemplateVideoInfo } from '../typing';

const SingleTemplate = observer(
  ({
    canvasInfo,
    templateId,
    withoutOffset = false,
  }: {
    canvasInfo: CanvasInfo;
    templateId?: string;
    withoutOffset?: boolean;
  }) => {
    const { canvasStyle, renderStyle } = useCanvasStyle(canvasInfo);
    const { template, index } = getTemplate(templateId);
    const previewVideoStatus = useGetPreviewVideoStatus();
    const videoHandler = usePreviewVideoHandler;
    const audioList = getAudioList();
    const prefix = useMemo(() => {
      return `SingleTemplate-${newDomId()}`;
    }, []);

    const videoInfo = useMemo<TemplateVideoInfo>(() => {
      if (withoutOffset) {
        return {
          ...template.videoInfo,
          allAnimationTime: template.videoInfo.pageTime,
          offsetTime: [0, 0],
        };
      }
      return template.videoInfo;
    }, [withoutOffset]);
    const [cs, ce] = template.videoInfo.offsetTime || [0, 0];

    const realVideoStatus = withoutOffset
      ? {
          ...previewVideoStatus,
          currentTime: cs + previewVideoStatus.currentTime,
        }
      : previewVideoStatus;

    // 销毁后，自动清楚预览状态
    useEffect(() => {
      return () => {
        clearPreviewStatus();
      };
    }, []);

    return template ? (
      <div className="hc-core-wrapper">
        <div className="hc-core-canvas" style={canvasStyle}>
          <div className="hc-core-canvas-render" style={renderStyle}>
            <Asset
              assets={template.assets}
              isPreview
              templateIndex={index}
              prefix={prefix}
              canvasInfo={canvasInfo}
              videoStatus={realVideoStatus}
              videoInfo={videoInfo}
              pageAttr={template.pageAttr}
            />
          </div>
        </div>
        <AudioWithTimeScale
          videoStatus={previewVideoStatus}
          audioList={audioList}
          templateIndex={index}
        />
        <VideoTimer
          endTime={template.videoInfo.allAnimationTime}
          videoStatus={previewVideoStatus}
          videoHandler={videoHandler}
        />
      </div>
    ) : (
      <div />
    );
  },
);
export default SingleTemplate;
