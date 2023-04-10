import { action, makeObservable, observable } from 'mobx';
import { config } from '@kernel/utils/config';
import type {
  CanvasInfo,
  VideoStatus,
  ContainerAddedAsset,
  ManualCurrent,
} from '@/kernel/typing';

export interface PreCheck {
  videoTimerLoad: boolean;
}

export function getDefaultVideoBaseDate() {
  return {
    playStatus: config.PlayStatus.Stopped,
    currentTime: 0,
  };
}

class GlobalStore {
  /**
   * @description 播放前预检
   * videoTimerLoad 视频基准加载器是否加载完成
   */
  @observable preCheck: PreCheck = {
    videoTimerLoad: true,
  };

  //
  @observable containerAddedAsset: ContainerAddedAsset = {
    index: -1,
    info: [],
  };

  @observable canvasInfo: CanvasInfo = {
    width: 0,
    height: 0,
    scale: 0,
  };

  // 预览画布，播放信息控制
  @observable previewPartOfVideoStatus: VideoStatus = getDefaultVideoBaseDate();

  // 预览画布，播放信息控制
  @observable previewVideoStatus: VideoStatus = getDefaultVideoBaseDate();

  // 主要画布，播放信息控制
  @observable videoStatus: VideoStatus = getDefaultVideoBaseDate();

  // 主要画布，播放信息控制
  @observable videoStatusOfPart: VideoStatus = getDefaultVideoBaseDate();

  @observable manualPreview = false;

  @observable manualCurrentTime?: ManualCurrent;

  @observable currentTimeRange = 0;

  constructor() {
    makeObservable(this);
  }

  @action
  setPreCheck = (data: Partial<PreCheck>) => {
    Object.assign(this.preCheck, data);
  };

  @action
  setCanvasInfo = (data: Partial<CanvasInfo>) => {
    Object.assign(this.canvasInfo, data);
  };

  @action
  setPreviewPartOfVideo = (data: Partial<VideoStatus>) => {
    Object.assign(this.previewPartOfVideoStatus, data);
  };

  @action
  setPreviewVideo = (data: Partial<VideoStatus>) => {
    Object.assign(this.previewVideoStatus, data);
  };

  @action
  setVideoInfo = (data: Partial<VideoStatus>) => {
    const { playStatus, currentTime } = data;
    if (
      playStatus !== undefined &&
      playStatus !== this.videoStatusOfPart.playStatus
    ) {
      if (playStatus !== this.videoStatusOfPart.playStatus) {
        this.videoStatusOfPart.playStatus = playStatus;
      }
      if (playStatus !== this.videoStatus.playStatus) {
        this.videoStatus.playStatus = playStatus;
      }
    }
    if (currentTime !== undefined) {
      this.videoStatus.currentTime = currentTime;
    }
  };

  @action
  setVideoInfoOfPart = (data: Partial<VideoStatus>) => {
    const { playStatus, currentTime = this.videoStatusOfPart.currentTime } =
      data;
    if (
      playStatus !== undefined &&
      playStatus !== this.videoStatusOfPart.playStatus
    ) {
      if (playStatus !== this.videoStatusOfPart.playStatus) {
        this.videoStatusOfPart.playStatus = playStatus;
      }
      if (playStatus !== this.videoStatus.playStatus) {
        this.videoStatus.playStatus = playStatus;
      }
    }
    this.videoStatusOfPart.currentTime = currentTime - this.currentTimeRange;
  };

  @action
  setCurrentTimeRange = (currentTimeRange: number) => {
    if (currentTimeRange !== this.currentTimeRange) {
      this.currentTimeRange = currentTimeRange;
    }
  };

  @action
  setManualPreview = (manualPreview: boolean) => {
    this.manualPreview = manualPreview;
  };

  @action
  setManualCurrent = (manualPreview?: ManualCurrent) => {
    this.manualCurrentTime = manualPreview;
  };
}

export default new GlobalStore();
