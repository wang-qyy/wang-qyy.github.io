import React from 'react';
import { PlayStatus } from '@kernel/utils/const';
import { config } from '@kernel/utils/config';
import { throttle } from 'lodash-es';

export interface VideoTimerHandlerConstructor {
  allAnimationTime: number;
  canPlayThrough: () => void;
  onVideoLoadError: (e: Event | string, src: string) => void;
  onCurrentTimeChange: (currentTime: number) => void;
}

export class VideoTimerHandler {
  videoDom?: HTMLVideoElement;

  // 空视频播放到1秒后重置，防止时间回流
  emptyVideoDuration = 1;

  // 空视频循环次数
  emptyVideoLoopTimes = 0;

  playStatus: PlayStatus = PlayStatus.Stopped;

  // video总时长
  videoDuration = 0;

  // 模板总播放时长
  allAnimationTime = 0;

  loopReportTimer?: number;

  videoTimerSrc = config.videoTimerSrc as string;

  // 视频是否加载成功
  loadSuccess = false;

  canPlayThrough: VideoTimerHandlerConstructor['canPlayThrough'];

  onVideoLoadError: VideoTimerHandlerConstructor['onVideoLoadError'];

  onCurrentTimeChange: VideoTimerHandlerConstructor['onCurrentTimeChange'];

  constructor({
    allAnimationTime,
    canPlayThrough,
    onCurrentTimeChange,
    onVideoLoadError,
  }: VideoTimerHandlerConstructor) {
    this.allAnimationTime = allAnimationTime;
    this.canPlayThrough = canPlayThrough;
    this.onVideoLoadError = onVideoLoadError;
    this.onCurrentTimeChange = onCurrentTimeChange;
    this.createVideoDom();
  }

  getCurrentTime = () => {
    if (this.videoDom) {
      const { currentTime } = this.videoDom;
      if (currentTime >= this.videoDuration) {
        this.emptyVideoLoopTimes += 1;
        this.videoDom.currentTime = 0;
        return (
          currentTime -
          this.videoDuration +
          this.emptyVideoLoopTimes * this.videoDuration
        );
      }
      return currentTime + this.emptyVideoLoopTimes * this.videoDuration;
    }
    return -1;
  };

  setCurrentTime = (currentTime: number) => {
    if (this.videoDom) {
      // 无背景视频特殊处理
      this.emptyVideoLoopTimes = Math.floor(currentTime);
      this.videoDom.currentTime = currentTime - this.emptyVideoLoopTimes;
    }
  };

  init = (videoDom: HTMLVideoElement) => {
    this.emptyVideoLoopTimes = 0;
    this.videoDom = videoDom;
    this.videoDuration = this.emptyVideoDuration;
    this.videoDom.currentTime = 0;
    this.videoDom.pause();
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
    const currentTime = this.getCurrentTime();
    this.onCurrentTimeChange(currentTime);

    this.clearRAF();
    this.loopReportTimer = requestAnimationFrame(this.loopReport);
  };

  play = () => {
    if (!this.loadSuccess) {
      console.log(
        'The video not loaded, please check src.(视频加载失败，请确认src是否正确)',
      );
      return;
    }
    this.playStatus = PlayStatus.Playing;
    this.videoDom?.play();
    this.loopReport();
  };

  stop = () => {
    this.playStatus = PlayStatus.Stopped;
    this.emptyVideoLoopTimes = 0;
    this.pause(0);
  };

  // 暂停后自动同步时间
  pause = (currentTime: number) => {
    this.clearRAF();
    this.playStatus = PlayStatus.Paused;
    if (this.videoDom) {
      this.videoDom.pause();
      this.videoDom.ontimeupdate = null;
      this.setCurrentTime(currentTime);
    }
  };

  createVideoDom = () => {
    const videoDom = document.createElement('video');
    videoDom.style.display = 'none';
    videoDom.style.zIndex = '-99999';
    videoDom.src = this.videoTimerSrc;
    // console.log('videoDom.src', src);
    videoDom.oncanplaythrough = () => {
      if (this.loadSuccess) {
        return;
      }
      this.loadSuccess = true;
      this.init(videoDom);
      this.canPlayThrough();
      // 检测到可以播放后，去除监听
      videoDom.oncanplaythrough = null;
    };

    videoDom.onerror = (e) => {
      this.onVideoLoadError(e, this.videoTimerSrc);
      this.loadSuccess = false;
    };
  };
}

export class VideoTimerByRAF {
  playStatus: PlayStatus = PlayStatus.Stopped;

  onCurrentTimeChange: VideoTimerHandlerConstructor['onCurrentTimeChange'];

  loopReportTimer?: number;

  currentTime = 0;

  timeMarker = 0;

  constructor(
    onCurrentTimeChange: VideoTimerHandlerConstructor['onCurrentTimeChange'],
  ) {
    this.onCurrentTimeChange = throttle(onCurrentTimeChange, 1000 / 30);
  }

  clearRAF = () => {
    if (this.loopReportTimer) {
      cancelAnimationFrame(this.loopReportTimer);
    }
  };

  loopReport = (timestamp: number) => {
    if (this.playStatus !== PlayStatus.Playing) {
      return;
    }
    if (this.timeMarker === 0) {
      this.timeMarker = timestamp;
    }
    this.currentTime = this.currentTime + timestamp - this.timeMarker;
    this.onCurrentTimeChange(this.currentTime);
    this.timeMarker = timestamp;
    this.clearRAF();
    this.loopReportTimer = requestAnimationFrame(this.loopReport);
  };

  play = (currentTime: number) => {
    this.playStatus = PlayStatus.Playing;
    this.currentTime = currentTime;
    this.timeMarker = 0;
    this.loopReport(performance.now());
  };

  stop = () => {
    this.playStatus = PlayStatus.Stopped;
    this.pause(0);
  };

  // 暂停后自动同步时间
  pause = (currentTime: number) => {
    this.clearRAF();
    this.currentTime = currentTime;
    this.playStatus = PlayStatus.Paused;
  };
}
