import { toJS } from 'mobx';
import { throttle } from 'lodash-es';

import {
  setCanvasInfo,
  videoHandler,
  useGetVideoStatus,
  global,
  getTimeScale,
  useTemplateLoaded,
  getTemplateList,
} from '@kernel/store';
import { config } from '@kernel/utils/config';
import { PlayStatus } from '@kernel/utils/const';
import { ManualCurrent } from '@/kernel';

export const useGetTimeScale = getTimeScale;
/**
 * @description 由于现在存在两种播放模式，所以可以根据该方法获取相对于当前模板的时间
 */
export const getRelativeCurrentTime = () => {
  if (config.wholeTemplate) {
    return global.videoStatusOfPart.currentTime;
  }
  return global.videoStatus.currentTime;
};
/**
 * @description 由于现在存在两种播放模式，所以可以根据该方法获取相对于全部模板的时间
 */
export const getAbsoluteCurrentTime = () => global.videoStatus.currentTime;
/**
 * @description 获取时间分割节点，absoluteCurrentTime - currentTimeRange = relativeCurrentTime
 */
export const getCurrentTimeRange = () => global.currentTimeRange;

function getVideoHandler() {
  return videoHandler;
}

export function setCurrentTime(currentTime: number, needFix = true) {
  const handler = getVideoHandler();
  handler.setCurrentTime(currentTime, needFix);
}

export const setCurrentTimeWithThrottle = throttle(setCurrentTime, 50);

export function pauseVideo() {
  const handler = getVideoHandler();
  handler.pauseVideo();
}

export function playVideo() {
  const handler = getVideoHandler();
  handler.playVideo();
}

export function stopVideo() {
  const handler = getVideoHandler();
  handler.stopVideo();
}

export function usePlayHandlerByObserver() {
  const isPlaying = useGetVideoStatus().playStatus === PlayStatus.Playing;

  return {
    isPlaying,
    playVideo,
    pauseVideo,
  };
}

/**
 * @description 指定视频时间节点
 */
export function useVideoHandler() {
  const { currentTime } = useGetVideoStatus();

  /**
   * @description 指定视频时间节点
   * @param currentTime 目前时间节点
   * @param needFix 是否需要转换成毫秒
   */
  function set(currentTime: number, needFix = false) {
    pauseVideo();
    setCurrentTime(currentTime, needFix);
  }

  return {
    setCurrentTime: set,
    currentTime,
  };
}

// 获取当前时间
export function getVideoCurrentTime() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useGetVideoStatus().currentTime;
}

/**
 * @description 清楚预览视频的播放状态
 */
export function clearPreviewStatus() {
  global.setPreviewVideo({
    playStatus: PlayStatus.Stopped,
    currentTime: 0,
  });
}

/**
 * @description 操作预览视频的时间轴
 */

export function usePreviewHandlerByObserver() {
  const { currentTime } = global.previewVideoStatus;

  /**
   * @description 指定视频时间节点
   * @param currentTime 目前时间节点,毫秒值
   */
  function set(currentTime: number) {
    pauseVideo();
    global.setPreviewVideo({
      currentTime,
    });
  }

  return {
    setCurrentTime: set,
    currentTime,
  };
}

export function playPreviewVideo() {
  global.setPreviewVideo({
    playStatus: PlayStatus.Playing,
  });
}

export function pausePreviewVideo() {
  global.setPreviewVideo({
    playStatus: PlayStatus.Paused,
  });
}

export function setPreviewCurrentTime(currentTime: number) {
  console.log('setPreviewCurrentTime', currentTime);

  global.setPreviewVideo({
    currentTime: Math.round(currentTime),
  });
}

// 设置播放的音量
export function setPreviewVideoVolume(vo: number) {
  global.setPreviewVideo({
    volume: vo,
  });
}

/**
 * @description 预览视频的播放控制
 */
export function usePreviewPlayHandlerByObserver() {
  const isPlaying = global.previewVideoStatus.playStatus === PlayStatus.Playing;
  const volume = global.previewVideoStatus?.volume || 100;
  return {
    volume,
    isPlaying,
    playVideo: playPreviewVideo,
    pauseVideo: pausePreviewVideo,
    setVolume: setPreviewVideoVolume,
  };
}

/**
 * @description 订阅canvas的缩放
 * @param canvasKey
 */
export function useCanvasScaleByObserver() {
  const value = global.canvasInfo.scale;

  /**
   * @description 修改缩放值
   * @param scale 缩放值
   */
  function update(scale: number) {
    setCanvasInfo({
      scale,
    });
  }

  return {
    update,
    value,
  };
}

export function getCanvasInfo() {
  return toJS(global?.canvasInfo);
}

/**
 * @description 监听模板加载状态，loadComplete为true表示加载成功，可以播放
 */
export function useTemplateLoadByObserver() {
  const loadComplete = useTemplateLoaded();

  return {
    loadComplete,
  };
}

/**
 * @description 切换视频播放状态
 */
export function toggleVideoPlay() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (useGetVideoStatus().playStatus === PlayStatus.Playing) {
    pauseVideo();
  } else {
    playVideo();
  }
}

/**
 * @description 切换预览视频的播放状态
 */
export function togglePreviewVideoPlay() {
  if (global.previewVideoStatus.playStatus === PlayStatus.Playing) {
    pausePreviewVideo();
  } else {
    playPreviewVideo();
  }
}
export function getTemplateIndexByCurrentTime(currentTime: number) {
  const templateList = getTemplateList();
  const timeRange: number[] = [];
  let allTime = 0;
  templateList.forEach((item) => {
    allTime += item.videoInfo.allAnimationTimeBySpeed;
    timeRange.push(allTime);
  });
  const index = timeRange.findIndex((item) => item > currentTime);
  if (index === -1 || index > templateList.length - 1) {
    return {
      templateIndex: 0,
      currentTime: 0,
      timeRange: 0,
    };
  }
  return {
    templateIndex: index,
    currentTime: currentTime - (timeRange[index] || 0),
    timeRange: timeRange[index] || 0,
  };
}

/**
 * @description 设置临时预览时间指针，需要用完及时设置为undefined，否则会影响正常播放
 * @param manualPreview
 */
export function setTempPreviewCurrentTime(manualPreview?: ManualCurrent) {
  if (manualPreview) {
    const { templateIndex, currentTime } = manualPreview;
    if (currentTime < 0) {
      return;
    }
    const templateList = getTemplateList();
    if (!templateList[templateIndex]) {
      global.setManualCurrent(undefined);
      global.setManualPreview(false);
      return;
    }
    const { pageTime } = templateList[templateIndex].videoInfo;
    global.setManualCurrent({
      templateIndex,
      currentTime: Math.min(Math.max(0, currentTime), pageTime - 10),
    });
    global.setManualPreview(true);
  } else {
    global.setManualCurrent(undefined);
    global.setManualPreview(false);
  }
}
export const { setManualPreview } = global;
