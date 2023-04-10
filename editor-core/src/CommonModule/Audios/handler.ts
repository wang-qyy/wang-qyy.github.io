import { MultipleAudio, addAudio, toJS } from '@hc/editor-core';
import {
  getActiveAudio,
  updateActiveAudio,
} from '@/store/adapter/useAudioStatus';

export function copyAndPasteAudio() {
  const result = addAudio(getActiveAudio());
  updateActiveAudio({ ...result });
}

export function formatAudiosTrack(audios: MultipleAudio[]) {
  const track: MultipleAudio[][] = [];

  for (let i = audios.length - 1; i >= 0; i--) {
    const audio = audios[i];

    if (audio.endTime - audio.startTime > 100) {
      const { startTime, endTime, speed: itemSpeed = 1 } = audio;
      const itemEndTime = endTime / itemSpeed;
      let inTrack = false;

      for (let trackIndex = 0; trackIndex < track.length; trackIndex++) {
        const trackItem = track[trackIndex];

        let inCurrent = true;

        for (let j = 0; j < trackItem.length; j++) {
          // 轨道
          const compare = trackItem[j];
          const { startTime: start, speed = 1 } = compare;
          const end = compare.endTime / speed;
          if (
            (startTime <= start && itemEndTime > start) ||
            (startTime >= start && itemEndTime <= end) ||
            (startTime < end && itemEndTime >= end) ||
            (startTime <= start && itemEndTime >= end)
          ) {
            inCurrent = false;
            break;
          }
        }

        if (inCurrent) {
          trackItem.push(audio);
          inTrack = true;
          break;
        }
      }

      if (!inTrack) {
        track.push([audio]);
      }
    }
  }

  return track;
}
