import React, { useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { config } from '@kernel/utils/config';
import { useMediaElementHandler } from '@kernel/utils/single';
import { VideoStatus, AssetLoadType } from '@kernel/typing';
import { loadAudio, loadVideo } from '@kernel/store';
import { PlayStatus } from '@kernel/utils/const';

const { handleVideoStatus } = config;

export interface AudioProps {
  src: string;
  isLoop: boolean;
  startTime: number;
  endTime: number;
  volume: number;
  index: number;
  duration: number;
  videoStatus: VideoStatus;
  loadInfo: AssetLoadType;
  onLoadOver: (status: boolean, msg?: any) => void;
  fadeIn?: number; // 淡入持续时长 0-5000
  fadeOut?: number; // 淡出持续时长 0-5000
  speed?: number;
  audioCut?: {
    startTime: number;
    endTime: number;
  };
}

export interface FadeTimeInfo {
  in: {
    s: number;
    e: number;
  };
  out: {
    s: number;
    e: number;
  };
}

function calcVolumePercent(currentTime: number, fadeTimeInfo: FadeTimeInfo) {
  const {
    in: { s: inStart, e: inEnd },
    out: { s: outStart, e: outEnd },
  } = fadeTimeInfo;
  let percent = 1;
  if (currentTime < inStart || currentTime > outEnd) {
    return 0;
  }
  if (currentTime > inEnd && currentTime < outStart) {
    return 1;
  }

  if (currentTime >= inStart && currentTime < inEnd) {
    percent = (currentTime - inStart) / (inEnd - inStart);
  }
  if (currentTime >= outStart && currentTime < outEnd) {
    const outDuration = outEnd - outStart;
    percent = (outDuration - (currentTime - outStart)) / outDuration;
  }

  return percent;
}

const AudioNode = observer((props: AudioProps) => {
  const {
    src,
    isLoop,
    startTime,
    endTime,
    videoStatus,
    volume,
    onLoadOver,
    fadeIn = 0,
    fadeOut = 0,
    audioCut,
    speed = 1,
  } = props;

  const volumeValue = useMemo(() => {
    return volume / 100;
  }, [volume]);

  const { targetRef, playerHelper, loadHandler } = useMediaElementHandler(
    startTime,
    endTime,
    {
      volume: volumeValue,
      isLoop,
      cst: audioCut?.startTime,
      cet: audioCut?.endTime,
    },
  );

  const { currentTime, playStatus } = videoStatus;
  const currentTimeInPlaying = currentTime;

  const [loaded, setLoaded] = useState<boolean>(false);

  function setVolume() {
    playerHelper?.setVolume(volumeValue);
  }

  useEffect(() => {
    loadAudio(src);
  }, []);

  function onCanPlayThrough() {
    if (loaded) {
      return;
    }
    loadAudio(src, true);
    onLoadOver(true);
    setLoaded(true);
    loadHandler();
  }

  function onError() {
    onLoadOver(false);
    loadAudio(src, false);
  }

  useEffect(() => {
    if (playerHelper && audioCut) {
      playerHelper.setVideoClip(
        {
          cet: audioCut.endTime,
          cst: audioCut.startTime,
        },
        currentTime,
      );
    }
  }, [audioCut?.startTime, audioCut?.endTime]);

  useEffect(() => {
    if (playerHelper) {
      const isPlaying = playStatus === PlayStatus.Playing;

      // 处于播放区间
      const inPlayTime =
        currentTime >= startTime &&
        currentTime <= startTime + (endTime - startTime) / speed;
      const videoIsPlaying = playerHelper.playStatus === PlayStatus.Playing;

      if (inPlayTime) {
        if (isPlaying && !videoIsPlaying) {
          playerHelper.play(
            startTime + (currentTimeInPlaying - startTime) * speed,
          );
        }
        if (!isPlaying) {
          playerHelper.pause(currentTimeInPlaying);
        }
      } else {
        if (playerHelper.playStatus !== PlayStatus.Stopped) {
          playerHelper.stop();
        }
      }
    }
  }, [playStatus, currentTime, startTime, endTime, speed]);

  const fadeTimeInfo = useMemo<FadeTimeInfo | undefined>(() => {
    if (fadeIn || fadeOut) {
      const end = endTime - startTime;
      return {
        in: {
          s: 0,
          e: fadeIn,
        },
        out: {
          s: end - fadeOut,
          e: end,
        },
      };
    }
  }, [fadeIn, startTime, fadeOut, endTime]);

  useEffect(() => {
    if (fadeTimeInfo) {
      const result =
        volumeValue *
        calcVolumePercent(currentTimeInPlaying - startTime, fadeTimeInfo);

      if (targetRef.current && targetRef.current.volume !== result) {
        targetRef.current.volume = result;
      }
    }
  }, [currentTime, startTime, endTime, fadeTimeInfo, volume]);
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
      setVolume();
    }
  }, [volume]);

  useEffect(() => {
    playerHelper?.setSpeed(speed);
  }, [speed, playerHelper]);

  useEffect(() => {
    if (playerHelper) {
      playerHelper.setVideoDuration({
        startTime,
        endTime,
      });
    }
  }, [startTime, endTime]);
  return (
    <audio
      src={src}
      controls={false}
      loop={isLoop}
      preload="auto"
      ref={targetRef}
      onCanPlayThrough={onCanPlayThrough}
      onError={onError}
      className="hc-hidden"
    />
  );
});

export default AudioNode;
