import {
  audioInfoAction,
  useAppDispatch,
  useAppSelector,
  store,
} from '@/store';
import { useEffect } from 'react';
import { isEqual } from 'lodash-es';
import { ActiveAudio } from '../reducer/audiosStatus';

export function setVolumeController(open: boolean) {
  store.dispatch(audioInfoAction.setVolumeController(open));
}

export function setSpeedController(open: boolean) {
  store.dispatch(audioInfoAction.setSpeedController(open));
}

export function useSetVolumeController() {
  const { volumeController } = useAppSelector(state => state.audios);

  return {
    visible: volumeController,
    setVolumeController,
  };
}

export function useSpeedController() {
  const { speedController } = useAppSelector(state => state.audios);

  return {
    visible: speedController,
    setSpeedController,
  };
}

export function getAudioStatus() {
  return store.getState().audios;
}

export function setActiveAudioInCliping(index: number) {
  if (getAudioStatus().inCliping !== index) {
    store.dispatch(audioInfoAction.setInCliping(index));
  }
}

export function updateActiveAudio(audio?: ActiveAudio) {
  if (getAudioStatus().activeAudio?.rt_id !== audio?.rt_id) {
    store.dispatch(audioInfoAction.setActiveAudio(audio));
  }
}

export function updateActiveAudioDuration(data: {
  startTime: number;
  endTime: number;
  cut?: [number, number];
}) {
  store.dispatch(audioInfoAction.setAudioInfo(data));
}

export function updateAudioVolume(volume: number) {
  store.dispatch(audioInfoAction.setAudioInfo({ volume }));
}

export function updateAudioSpeed(speed: number) {
  store.dispatch(audioInfoAction.setAudioInfo({ speed }));
}

export function updateAudioFade(params: { fadeIn?: number; fadeOut?: number }) {
  store.dispatch(audioInfoAction.setAudioInfo(params));
}

export function useSetActiveAudio() {
  const { activeAudio, inCliping } = useAppSelector(state => state.audios);

  return {
    activeAudio,
    updateActiveAudio,
    inCliping,
    setActiveAudioInCliping,
  };
}

export function getActiveAudio() {
  return store.getState().audios.activeAudio;
}

export function audioBlur() {
  store.dispatch(audioInfoAction.clear());
}
