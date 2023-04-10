import audiosHandler from '@kernel/store/audioHandler';

/**
 * @description 获取音乐列表
 */
export function getAudioList() {
  return audiosHandler.multiAudios;
}
