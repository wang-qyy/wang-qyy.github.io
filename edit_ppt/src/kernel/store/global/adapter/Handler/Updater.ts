import type { CanvasInfo } from '@kernel/typing';
import { PreCheck } from '@kernel/store/Global';
import { config } from '@kernel/utils/config';
import global from '@kernel/store/global';
import { VideoClip } from '@kernel/typing';
import { PlayStatus } from '@kernel/utils/const';

export type SetVideoInfoType = typeof global.setVideoInfo;
/**
 * @description 设置目标global的canvasinfo
 */
export const setCanvasInfo = (data: Partial<CanvasInfo>) => {
  global.setCanvasInfo(data);
};

export function useUpdateCanvasInfo() {
  return (data: Partial<CanvasInfo>) => {
    global.setCanvasInfo(data);
  };
}

/**
 * @description 设置预检信息
 */
export const setPreCheck = (canvasKey: string, data: PreCheck) => {
  global.setPreCheck(data);
};

export function useUpdatePreCheck() {
  return (data: PreCheck) => {
    global.setPreCheck(data);
  };
}

function createVideoHandler(key: keyof typeof global) {
  return {
    pauseVideo: () => {
      (global[key] as SetVideoInfoType)({
        playStatus: config.PlayStatus.Paused,
      });
    },
    stopVideo: () => {
      (global[key] as SetVideoInfoType)({
        playStatus: config.PlayStatus.Stopped,
        currentTime: 0,
      });
    },
    playVideo: () => {
      (global[key] as SetVideoInfoType)({
        playStatus: config.PlayStatus.Playing,
      });
    },
    setCurrentTime: (currentTime: number, needFix = true) => {
      const time = currentTime * (needFix ? 1000 : 1);
      (global[key] as SetVideoInfoType)({
        currentTime: time,
        currentTimeWithClip: time,
      });
    },
  };
}

/**
 * @description 操作当前视频
 */
export const videoHandler = createVideoHandler('setVideoInfo');
// 开始播放视频
export const { playVideo, setCurrentTime, stopVideo, pauseVideo } =
  videoHandler;

export function setCurrentTimeWithClip(clip: VideoClip) {
  const clipTemp = [...clip];
  return (currentTime: number, needFix = true) => {
    const time = currentTime * (needFix ? 1000 : 1);
    global.setVideoInfo({
      currentTime: Math.round(time),
      currentTimeWithClip: Math.round(time + clipTemp[0]),
    });
  };
}

export const usePreviewVideoHandler = createVideoHandler('setPreviewVideo');

export const {
  playVideo: playPreviewVideo,
  setCurrentTime: setCurrentTimePreview,
  stopVideo: stopPreviewVideo,
  pauseVideo: pausePreviewVideo,
} = usePreviewVideoHandler;

export function setCurrentTimePreviewWithClip(clip: VideoClip) {
  const clipTemp = [...clip];
  return (currentTime: number, needFix = true) => {
    const time = currentTime * (needFix ? 1000 : 1);
    global.setVideoInfo({
      currentTime: Math.round(time),
      currentTimeWithClip: Math.round(time + clipTemp[0]),
    });
  };
}

export const useVideoByPartHandler = createVideoHandler('setVideoInfoOfPart');

/**
 * @description 操作当前视频
 */
export const useVideoStatusByPartHandler = () => ({
  videoStatus: global.videoStatusOfPart,
  setVideoStatus: global.setVideoInfoOfPart,
  resetVideoStatus: () => {
    global.setVideoInfoOfPart({
      playStatus: PlayStatus.Stopped,
      currentTime: 0,
    });
    global.setCurrentTimeRange(0);
  },
  setCurrentTimeRange: (timeRange: number) => {
    global.setCurrentTimeRange(timeRange);
  },
});
