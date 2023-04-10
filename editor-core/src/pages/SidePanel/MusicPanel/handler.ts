export enum PlayStatus {
  Stopped = -1,
  Paused,
  Playing,
}

export class MediaElementHandler {
  node: HTMLAudioElement | HTMLVideoElement;

  loopReportTimer?: number;

  startTime: number;

  playStatus: PlayStatus = PlayStatus.Stopped;

  onCurrentTimeChange: (currentTime: number) => void;

  onEnd: () => void;

  endTime: number;

  constructor(
    node: HTMLAudioElement | HTMLVideoElement,
    startTime: number,
    endTime: number,
    onChange: (currentTime: number) => void,
    onEnd: () => void,
  ) {
    this.node = node;
    this.startTime = startTime;
    this.endTime = endTime;
    this.onCurrentTimeChange = onChange;
    this.onEnd = onEnd;
  }

  /**
   * @description 纠正当前的播放时间
   * @param currentTime
   */
  protected correctCurrentTime = (currentTime: number) => {
    this.node.currentTime = currentTime;
  };

  getCurrentTime = () => {
    if (this.node) {
      return this.node.currentTime;
    }
    return -1;
  };

  setCurrentTime = (currentTime: number) => {
    if (this.node) {
      this.node.currentTime = currentTime;
    }
  };

  setVolume = (volume: number) => {
    if (this.node) {
      this.node.volume = volume;
    }
  };

  clearRAF = () => {
    if (this.loopReportTimer) {
      cancelAnimationFrame(this.loopReportTimer);
    }
  };

  loopReport = () => {
    if (this.playStatus !== PlayStatus.Playing) {
      return;
    }
    this.onCurrentTimeChange(this.getCurrentTime());

    this.clearRAF();
    // @ts-ignore
    this.loopReportTimer = setTimeout(() => {
      this.loopReport();
    }, 200);
  };

  play = (currentTime: number) => {
    this.node.currentTime = currentTime;
    this.node.play();
    this.playStatus = PlayStatus.Playing;
    this.loopReport();
  };

  pause = () => {
    this.clearRAF();
    this.playStatus = PlayStatus.Paused;
    if (this.node) {
      this.node.pause();
      this.node.ontimeupdate = null;
    }
  };

  stop = () => {
    this.playStatus = PlayStatus.Stopped;
    this.pause();
    this.node.currentTime = 0;
  };

  setTime = (time: number) => {
    this.node.currentTime = time;
  };
}
