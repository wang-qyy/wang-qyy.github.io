import assetHandler from '@kernel/store/assetHandler';
import audiosHandler from '@kernel/store/audioHandler';
import { reportChange } from '@kernel/utils/config';
import { setAudioInitOver } from '@kernel/store';
import { formatAudio } from '@kernel/utils/assetHelper/formater';
import type { MultipleAudio, BaseMultipleAudio } from '@kernel/typing';

export {
  autoSetSingleBGMDuration,
  autoSetAudioDuration,
} from '@kernel/store/audioHandler/adapter';

export function useBGMLoadingByObserver() {
  const loading = assetHandler.assetLoaded;

  return {
    loading,
  };
}

export function getIndexById(id: number) {
  return audiosHandler.multiAudios.findIndex(item => item.rt_id === id);
}

/**
 * @description 获取所有的音频数据
 */
export function getAllAudios() {
  return audiosHandler.multiAudios;
}

/**
 * @description 获取其他音频列表
 */
export function getAudioList() {
  return audiosHandler.audioList;
}

/**
 * @description 获取bgm列表
 */
export function getBGMList() {
  return audiosHandler.BGMList;
}

/**
 * @description 设置初始化的audio，此api会替换原来所有的音轨，使用时要注意
 * @param audios
 */
export function initAudios(audios: MultipleAudio[]) {
  setAudioInitOver(false);
  const processLoopAudios: MultipleAudio[] = [];
  audios.forEach(item => {
    if (item.isLoop) {
      const { startTime, endTime } = item;
      const allTime = endTime - startTime;

      item.isLoop = false;
      let duration = item.rt_duration;
      if (item.cut) {
        duration = item.cut[1] - item.cut[0];
      }
      if (allTime > duration) {
        const rate = Math.ceil(allTime / duration);
        let endTime = 0;
        for (let index = 0; index < rate; index++) {
          const newEndTime = endTime + duration;
          const newAudio = {
            ...item,
            startTime: endTime,
            endTime: Math.min(newEndTime, allTime),
          };
          processLoopAudios.push(newAudio);
          endTime = newAudio.endTime;
        }
      } else {
        processLoopAudios.push(item);
      }
    } else {
      processLoopAudios.push(item);
    }
  });

  const newAudios = processLoopAudios.map(formatAudio) as MultipleAudio[];
  audiosHandler.setAudios(newAudios);
  setAudioInitOver(true);
  return newAudios;
}

/**
 * @description 替换bgm
 * @param data
 * @param id
 */
export function replaceAudio(data: BaseMultipleAudio, id: number) {
  const index = getIndexById(id);
  const result = formatAudio(data);
  audiosHandler.replaceAudio(result as MultipleAudio, index);
  reportChange('replaceAudio', true);
  return result;
}

/**
 * @description 重置音频列表
 * @param list
 */
export function setAudios(list: MultipleAudio[]) {
  // const audios = list.map(item => formatAudio(item) as MultipleAudio);

  audiosHandler.setAudios(list);
  reportChange('setAudios', true);

  // return list;
}

/**
 * @description 调整播放音量
 * @param volume 0-100之间的整数
 * @param id
 */
export function setVolume(volume: number, id: number) {
  const index = getIndexById(id);

  audiosHandler.updateAudio({ volume }, index);
  reportChange('setVolume', true);
}

/**
 * @description 调整音频倍速
 * @param speed 0-100之间的整数
 * @param id
 */
export function setSpeed(speed: number, id: number) {
  const index = getIndexById(id);

  audiosHandler.updateAudio({ speed }, index);
  reportChange('setSpeed', true);
}

export function setFadeIn(fadeIn: number, id: number) {
  const index = getIndexById(id);
  audiosHandler.updateAudio({ fadeIn }, index);
  reportChange('setFadeIn', true);
}

export function setFadeOut(fadeOut: number, id: number) {
  const index = getIndexById(id);
  audiosHandler.updateAudio({ fadeOut }, index);
  reportChange('setFadeOut', true);
}

/**
 * @description 调整播放音量
 * @param isLoop
 * @param id
 */
export function setLoop(isLoop: boolean, id: number) {
  const index = getIndexById(id);
  audiosHandler.updateAudio({ isLoop }, index);
  reportChange('setLoop', true);
}

/**
 * @description 调整持续时间
 * @param time
 * @param id
 */
export function setAudioDuration(
  time: { startTime: number; endTime: number },
  id: number,
) {
  const index = getIndexById(id);
  audiosHandler.updateAudio(time, index);
  // 用户调整过持续时间，说明用户不需要自动设置bgm时长
  audiosHandler.audioIsUserControl(index);
  reportChange('setAudioDuration', true);
}

/**
 * @description 调整音频裁剪
 * @param time
 * @param id
 */
export function setAudioCut(
  time: { startTime: number; endTime: number },
  id: number,
) {
  const index = getIndexById(id);
  audiosHandler.updateAudio(
    {
      cut: [time.startTime, time.endTime],
    },
    index,
  );
  reportChange('setAudioCut', true);
}

/**
 * @description 调整持续时间
 * @param id
 */
export function removeAudio(id: number) {
  audiosHandler.removeAudio(id);
  reportChange('removeAudio', true);
}

/**
 * @description 调整持续时间
 * @param data
 */
export function addAudio(data: BaseMultipleAudio) {
  const audio = formatAudio(data) as MultipleAudio;

  audiosHandler.addAudio(audio);
  reportChange('addAudio', true);

  return audio;
}

/**
 * @description 获取音频有没有被修改过状态
 */
export function getAudioEditStatus() {
  return audiosHandler.replaced;
}

/**
 * @description 设置音频修改状态
 */
export function setAudioEditStatus(statue: boolean) {
  audiosHandler.setReplaced(statue);
}

/**
 * @description 音频管理，需要搭配observable
 */
export function useAudios() {
  return {
    replaceAudio,
    setVolume,
    setLoop,
    setAudios,
    setAudioDuration,
    setAudioCut,
    addAudio,
    removeAudio,
    setFadeIn,
    setFadeOut,
    setSpeed,
    value: getAudioList(),
  };
}

/**
 * @description BGM管理，需要搭配observable
 */
export function useBGMs() {
  return {
    replaceAudio,
    setVolume,
    setLoop,
    setAudioDuration,
    setAudioCut,
    addAudio,
    removeAudio,

    value: getBGMList(),
  };
}
