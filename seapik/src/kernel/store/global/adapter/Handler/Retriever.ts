import globalStore from '@kernel/store/global';
import { config } from '@kernel/utils/config';

export function useGetVideoStatus() {
  return globalStore.videoStatus;
}

export function useGetVideoStatusOfPart() {
  return globalStore.videoStatusOfPart;
}

export function useGetPreviewVideoStatus() {
  return globalStore.previewVideoStatus;
}

export function getManualPreview() {
  return globalStore.manualPreview;
}

/* 对videoInfo的操作 */
export function useGetCanvasInfo() {
  return globalStore.canvasInfo;
}
export function useGetManualCurrentTime() {
  return globalStore.manualCurrentTime;
}
export function useGetCanvasInfoByScale() {
  const { width, height, scale } = globalStore.canvasInfo;
  return {
    width: width * scale,
    height: height * scale,
    scale,
  };
}

export const getCanvasInfo = useGetCanvasInfo;
/**
 * @description 由于现在存在两种播放模式，所以可以根据该方法获取相对于当前模板的时间
 */
export const getRelativeCurrentTime = () => {
  if (config.wholeTemplate) {
    return globalStore.videoStatusOfPart.currentTime;
  }
  return globalStore.videoStatus.currentTime;
};
/**
 * @description 由于现在存在两种播放模式，所以可以根据该方法获取相对于全部模板的时间
 */
export const getAbsoluteCurrentTime = () => globalStore.videoStatus.currentTime;
