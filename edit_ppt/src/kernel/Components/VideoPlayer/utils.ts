import type { AssetClass, VideoStatus } from '@kernel/typing';

export function useVideoPlayer(asset: AssetClass, videoInfo: VideoStatus) {
  const {
    rt_url = '',
    startTime,
    endTime,
    isLoop = false,
    videoVolume = 0,
    cst,
    cet,
    voiced,
    volume = 0,
  } = asset.attribute;
  const { isBackground } = asset.meta;
  const { playStatus, currentTime } = videoInfo;

  const defaultProps = {
    isLoop: isBackground || isLoop,
    // volume: Number((videoVolume / 100).toFixed(2)),
    volume: Number((volume / 100).toFixed(2)),
    muted: !voiced,
    url: rt_url,
    startTime,
    endTime,
    videoPlayStatus: playStatus,
    currentTime,
    cst,
    cet,
  };
  return {
    defaultProps,
  };
}
