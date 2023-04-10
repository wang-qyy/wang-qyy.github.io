import { CanvasInfo } from '@kernel/typing';
import global from '@kernel/store/global';
import { config } from '@kernel/utils/config';

export function initGlobal(canvasInfo: CanvasInfo) {
  global.setCanvasInfo(canvasInfo);
  const videoInfo = {
    playStatus: config.PlayStatus.Stopped,
    currentTime: 0,
  };
  global.setVideoInfo({
    ...videoInfo,
  });
  global.setPreviewVideo({
    ...videoInfo,
  });

  global.setStatus({
    inClipping: false,
    inReplacing: false,
  });
}
