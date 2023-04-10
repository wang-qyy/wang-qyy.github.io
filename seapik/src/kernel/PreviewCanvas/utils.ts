import {
  PageAttr,
  TemplateBackground,
  TemplateData,
  VideoStatus,
} from '@kernel/typing';
import { getTemplateList, getTimeScale } from '@kernel/store';
import { PreviewVideoStatusHandler } from '@kernel/PreviewCanvas/store';
import { useMemo } from 'react';

export function filterTemplateBackground(template: TemplateData | undefined) {
  if (template) {
    const result = {
      backgroundColor: template.pageAttr.backgroundColor,
      backgroundImage: template.pageAttr.backgroundImage,
    };
    return result as TemplateBackground;
  }
  return undefined;
}

export function getTemplateBackgroundByPageAttr(pageAttr?: PageAttr) {
  if (pageAttr) {
    const result = {
      backgroundColor: pageAttr.backgroundColor,
      backgroundImage: pageAttr.backgroundImage,
    };
    return result as TemplateBackground;
  }
  return undefined;
}

export type VideoStatusHandler = typeof PreviewVideoStatusHandler;

export function useGetCurrentTimeByCurrentTemplate(
  videoStatusOrigin: VideoStatus,
  videoStatusHandler: VideoStatusHandler,
) {
  const templateList = getTemplateList();
  const timeScale = getTimeScale();

  const { videoStatus, setVideoStatus, resetVideoStatus, setCurrentTimeRange } =
    videoStatusHandler;

  const timerVideoInfo = useMemo(() => {
    let allTime = 0;
    const timeRange: number[] = [];
    templateList.forEach((item) => {
      allTime += item.videoInfo.allAnimationTimeBySpeed;
      timeRange.push(allTime);
    });
    return {
      startTime: 0,
      endTime: allTime,
      allAnimationTime: allTime,
      timeRange,
    };
  }, [timeScale]);

  const currentTemplateIndex = useMemo(() => {
    const index = timerVideoInfo.timeRange.findIndex(
      // item => item >= videoStatusOrigin.currentTime,
      (item) => item > videoStatusOrigin.currentTime,
    );
    if (index === -1 || index > templateList.length - 1) {
      return 0;
    }

    return index;
  }, [videoStatusOrigin.currentTime, timerVideoInfo]);

  const template = useMemo(() => {
    setCurrentTimeRange(
      timerVideoInfo.timeRange[currentTemplateIndex - 1] ?? 0,
    );
    return templateList[currentTemplateIndex];
  }, [currentTemplateIndex]);

  setVideoStatus({ ...videoStatusOrigin });

  return {
    videoStatus,
    resetVideoStatus,
    template,
    templateList,
    timerVideoInfo,
    currentTemplateIndex,
  };
}
