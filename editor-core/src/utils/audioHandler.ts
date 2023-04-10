import { message } from 'antd';
import {
  getVideoCurrentTime,
  addAudio,
  setAudioCut,
  setAudioDuration,
  useVideoHandler,
  BaseMultipleAudio,
  toJS,
} from '@hc/editor-core';
import {
  getActiveAudio,
  useSetActiveAudio,
  updateActiveAudio,
} from '@/store/adapter/useAudioStatus';
import { audioMinDuration } from '@/config/basicVariable';

function canSplitAudio(audio?: BaseMultipleAudio) {
  const currentTime = getVideoCurrentTime();
  if (!audio) return false;

  return !(
    currentTime - audio.startTime < audioMinDuration ||
    currentTime > audio.endTime
  );
}

/**
 * @description 音频分割
 * */
export function splitAudio() {
  const currentTime = getVideoCurrentTime();
  const activeAudio = getActiveAudio();

  if (!canSplitAudio(activeAudio)) {
    return;
  }

  if (activeAudio) {
    const { rt_id, speed = 1 } = activeAudio;
    const { startTime, endTime, cut = [0, endTime - startTime] } = activeAudio;
    const durationWithSpeed = (endTime - startTime) / speed;
    const splitDistance = currentTime - startTime;

    const [cs, ce] = cut;

    const newAudio = {
      ...activeAudio,
      startTime: currentTime,
      endTime: currentTime + (durationWithSpeed - splitDistance) * speed,
    };

    // newAudio.startTime = currentTime;
    Object.assign(newAudio, {
      cut: [cs + (currentTime - startTime) * speed, ce],
    });
    // Object.assign(newAudio, { cut: [ce - (endTime - currentTime), ce] });

    const result = addAudio(newAudio);

    // 更新原始音频
    setAudioCut({ startTime: cs, endTime: cs + splitDistance * speed }, rt_id);
    setAudioDuration(
      { startTime, endTime: startTime + splitDistance * speed },
      rt_id,
    );
    // 默认选中第二段音频
    updateActiveAudio(result);
  }
}

/**
 * @description 音频分割
 * */
export function useSplitAudio() {
  const { activeAudio } = useSetActiveAudio();
  const { currentTime } = useVideoHandler();

  return {
    splitAudio,
    disabled: !canSplitAudio(activeAudio),
  };
}
