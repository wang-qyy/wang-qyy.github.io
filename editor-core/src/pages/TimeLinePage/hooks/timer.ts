import { useCallback } from 'react';

import { useVideoHandler } from '@/kernel';

import timeLinePageStore from '../store';

// 监听播放时间
export const useCurrentTime = () => {
  const { setCurrentTime, currentTime } = useVideoHandler();
  const { durationInfo } = timeLinePageStore;
  const { offsetTime } = durationInfo;

  const updateCurrentTime = useCallback(
    (newTime: number) => {
      if (newTime + offsetTime === currentTime) return;
      setCurrentTime(newTime + offsetTime);
    },
    [offsetTime, currentTime],
  );

  return {
    currentTime: currentTime - durationInfo.offsetTime,
    updateCurrentTime,
  };
};
