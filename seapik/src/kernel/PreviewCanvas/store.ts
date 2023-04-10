import { action, makeObservable, observable } from 'mobx';
import { VideoStatus } from '@kernel/typing';
import { PlayStatus } from '@kernel/utils/const';

class PreviewCanvasStore {
  @observable videoStatus = {
    playStatus: PlayStatus.Stopped,
    currentTime: 0,
  };

  @observable videoStatusClip = {
    playStatus: PlayStatus.Stopped,
    currentTime: 0,
  };

  @observable currentTimeRange = 0;

  constructor() {
    makeObservable(this);
  }

  @action
  setVideoStatus = (data: Partial<VideoStatus>) => {
    const { playStatus, currentTime = this.videoStatus.currentTime } = data;
    // console.log('setVideoStatus');
    if (
      playStatus !== undefined &&
      playStatus !== this.videoStatus.playStatus
    ) {
      this.videoStatus.playStatus = playStatus;
    }
    // currentTime不能小于0
    this.videoStatus.currentTime = Math.max(
      0,
      currentTime - this.currentTimeRange,
    );
  };

  @action
  setCurrentTimeRange = (currentTimeRange: number) => {
    if (currentTimeRange !== this.currentTimeRange) {
      this.currentTimeRange = currentTimeRange;
    }
  };

  @action
  resetVideoStatus = () => {
    Object.assign(this.videoStatus, {
      playStatus: PlayStatus.Stopped,
      currentTime: 0,
    });

    this.currentTimeRange = 0;
  };
}

const store = new PreviewCanvasStore();

export const PreviewVideoStatusHandler = {
  videoStatus: store.videoStatus,
  setVideoStatus: store.setVideoStatus,
  resetVideoStatus: store.resetVideoStatus,
  setCurrentTimeRange: store.setCurrentTimeRange,
};
