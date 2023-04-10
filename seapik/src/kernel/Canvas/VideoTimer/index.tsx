import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { config } from '@kernel/utils/config';
import { useCreation } from 'ahooks';
import { VideoHandler, VideoStatus } from '@kernel/typing';
import { PlayStatus } from '@kernel/utils/const';
import { VideoTimerByRAF } from './utils';

export interface VideoTimerProps {
  videoStatus: VideoStatus;
  videoHandler: VideoHandler;
  endTime: number;
  startTime?: number;
}

const VideoTimer = observer(
  ({ videoStatus, videoHandler, endTime, startTime }: VideoTimerProps) => {
    function onCurrentTimeChange(currentTime: number) {
      videoHandler.setCurrentTime(currentTime, false);
    }

    const handler = useCreation<VideoTimerByRAF>(
      () => new VideoTimerByRAF(onCurrentTimeChange),
      [],
    );

    useEffect(() => {
      // 如果出现模板裁剪，则以裁剪结束时间为准
      if (videoStatus.currentTime >= endTime) {
        // 只有播放的时候，超时自动回正。手动拖拽进度条，则不需要自动回正
        if (videoStatus.playStatus === PlayStatus.Playing) {
          videoHandler.stopVideo();
          handler.stop();
        } else {
          videoHandler.setCurrentTime(endTime - 1, false);
        }
      }
      // 只有暂停时，可以操作进度条
      if (videoStatus.playStatus !== PlayStatus.Playing) {
        handler.pause(config.calculateVideoTime(videoStatus.currentTime));
      }
    }, [videoStatus.currentTime]);

    useEffect(() => {
      config.handleVideoStatus(videoStatus.playStatus, {
        onPlay: () => {
          handler.play(videoStatus.currentTime);
        },
        onPause: () => {
          handler.pause(videoStatus.currentTime);
        },
        onStop: () => {
          handler.stop();
        },
      });
    }, [videoStatus.playStatus]);

    useEffect(() => {
      return () => {
        videoHandler.stopVideo();
        handler.stop();
        // videoHandler.pauseVideo();
        // handler.pause(videoStatus.currentTime);
      };
    }, []);
    return <></>;
  },
);

const Index = observer((props: VideoTimerProps) => {
  return <VideoTimer {...props} />;
});
export default Index;
