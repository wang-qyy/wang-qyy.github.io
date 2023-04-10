import { useEffect, useState } from 'react';
import {
  usePlayHandlerByObserver,
  useTemplateLoadByObserver,
  setCurrentTime,
  getAbsoluteCurrentTime,
} from '@hc/editor-core';
import { windowsLoading } from '@/utils/single';

export default function useCanvasPlayHandler() {
  const [needAutoPlay, setNeedAutoPlay] = useState(false);
  const { isPlaying, playVideo, pauseVideo } = usePlayHandlerByObserver();
  const { loadComplete } = useTemplateLoadByObserver();

  function pause() {
    pauseVideo();
    const time = getAbsoluteCurrentTime();
    setCurrentTime(Math.round(time / 100) * 100, false);
  }

  function play() {
    playVideo();
    windowsLoading.closeWindowsLoading();
  }
  function handlePlayVideo() {
    if (loadComplete) {
      play();
    } else {
      // 阻止播放后，需要在loading后自动播放
      setNeedAutoPlay(true);
      windowsLoading.openWindowsLoading();
    }
  }
  useEffect(() => {
    if (needAutoPlay && loadComplete) {
      setNeedAutoPlay(false);
      setTimeout(() => {
        play();
      }, 50);
    }
  }, [needAutoPlay, loadComplete]);
  return {
    isPlaying,
    pauseVideo: pause,
    playVideo: handlePlayVideo,
  };
}
