import React, { memo, useState, useEffect } from 'react';
import { assetIdPrefix, PlayStatus } from '@kernel/utils/const';
import { useMediaElementHandler } from '@kernel/utils/single';
import { loadVideo } from '@kernel/store';
import { observer } from 'mobx-react';

export interface VideoPlayerProps {
  isLoop: boolean;
  volume: number;
  muted: boolean;
  videoPlayStatus: PlayStatus;
  url: string;
  currentTime: number;
  startTime: number;
  endTime: number;
  cst?: number;
  cet?: number;
  className?: string;
  style?: React.CSSProperties;
  speed?: number;
  id: number;
}

function VideoPlayer(props: VideoPlayerProps) {
  const {
    isLoop,
    volume,
    muted,
    videoPlayStatus,
    url,
    className,
    style,
    currentTime,
    startTime = 0,
    endTime = 0,
    cst,
    cet,
    speed = 1,
    id,
  } = props;

  const [currentUrl, setCurrentUrl] = useState('');

  const { targetRef, playerHelper, loadHandler } = useMediaElementHandler(
    startTime,
    endTime,
    {
      volume,
      cst,
      cet,
      isLoop,
    },
  );

  useEffect(() => {
    if (playerHelper) {
      const isPlaying = videoPlayStatus === PlayStatus.Playing;
      // 处于播放区间
      const inPlayTime = currentTime >= startTime && currentTime <= endTime;
      const videoIsPlaying = playerHelper.playStatus === PlayStatus.Playing;
      // todo
      // const currentTimeStart = currentTime - startTime;
      if (inPlayTime) {
        if (isPlaying && !videoIsPlaying) {
          playerHelper.play(currentTime);
        }
        if (!isPlaying) {
          playerHelper.pause(currentTime);
        }
      } else {
        if (playerHelper.playStatus !== PlayStatus.Stopped) {
          playerHelper.stop();
        }
      }
    }
  }, [videoPlayStatus, currentTime]);

  useEffect(() => {
    if (playerHelper && typeof cst === 'number' && typeof cet === 'number') {
      playerHelper.setVideoClip(
        {
          cst,
          cet,
        },
        currentTime,
      );
    }
  }, [cst, cet]);
  useEffect(() => {
    if (playerHelper) {
      playerHelper.setVideoDuration({
        startTime,
        endTime,
      });
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (playerHelper) {
      playerHelper.setLoop(isLoop);
    }
  }, [isLoop]);

  useEffect(() => {
    if (playerHelper) {
      playerHelper.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    loadVideo(url);
  }, []);

  useEffect(() => {
    if (playerHelper) {
      playerHelper.setSpeed(speed);
    }
  }, [speed, playerHelper]);

  function onCanPlayThrough() {
    if (currentUrl !== url) {
      const ins = loadHandler();
      setCurrentUrl(url);
      ins?.pause(currentTime);
      // console.log(url, 'video onCanPlayThrough');
      loadVideo(url, true);
    }
  }

  function onError() {
    if (url.includes('webm')) {
      loadVideo(url, true);
    } else {
      loadVideo(url, false);
    }
  }

  return (
    <video
      src={url}
      disablePictureInPicture
      playsInline
      preload="auto"
      className={className || ''}
      ref={targetRef}
      style={style || {}}
      crossOrigin="anonymous"
      onCanPlayThrough={onCanPlayThrough}
      onError={onError}
      muted={muted}
      data-asset-id={`${assetIdPrefix}${id}`}
    />
  );
}

export default observer(VideoPlayer);
