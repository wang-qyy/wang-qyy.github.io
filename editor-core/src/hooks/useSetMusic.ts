import { message } from 'antd';

import {
  useBGMs,
  useAudios,
  MultipleAudio,
  getAllTemplateVideoTime,
  getAbsoluteCurrentTime,
  getAllAudios,
} from '@hc/editor-core';
import { audioMinDuration } from '@/config/basicVariable';

import { useSetActiveAudio } from '@/store/adapter/useAudioStatus';

/**
 * @description 音频类型
 * @enum 1-背景音乐、2-配乐
 * 目前不区分背景音乐和配乐统一为2
 * */
type AudioType = 1 | 2;

export interface AddAudioParams {
  rt_title: string;
  resId: string | number;
  type: AudioType;
  rt_url: string;
  volume: number;
  isLoop: boolean;
  ufsId?: string;
  // 音频时长
  rt_duration: number;
  rt_sourceType: AudioSourceType;
  startTime?: number;
  endTime?: number;
}

/**
 * @description 音频类型
 * @enum 1-上传，2-AI文字转语音，3-录音，undefine-云端音乐
 */
type AudioSourceType = 1 | 2 | 3;

export function getNewAudioDuration(
  source_type: AudioSourceType,
  params: AddAudioParams,
) {
  const videoTotalTime = getAllTemplateVideoTime();
  if (
    (!source_type || source_type === 1) &&
    !(Number(params.startTime) > 0) &&
    getAllAudios().length < 1
  ) {
    // 当前视频没有音频，添加音乐默认从头到尾贯穿
    return {
      startTime: 0,
      endTime: Math.min(videoTotalTime, Number(params.rt_duration)),
    };
  }

  let startTime = params.startTime ?? Math.round(getAbsoluteCurrentTime());
  startTime = Math.min(videoTotalTime - audioMinDuration, startTime);
  startTime = Math.max(0, startTime);
  return {
    startTime,
    endTime: Math.min(
      videoTotalTime,
      Number(startTime) + Number(params.rt_duration),
    ),
  };
}

export const useSetMusic = () => {
  const {
    replaceAudio,
    setVolume,
    setLoop,
    setAudioDuration,
    setAudioCut,
    addAudio,
    removeAudio,
    setAudios,
    setSpeed,
    value: audioList,
  } = useAudios();
  const { value: BGMList } = useBGMs();

  const { updateActiveAudio } = useSetActiveAudio();

  // 替换全部背景音乐
  const bindSetBgAudios = (list: MultipleAudio[]) => {
    const allAudios = getAllAudios();
    const aiAudios = allAudios.filter(t => t.rt_sourceType === 2);
    setAudios([...aiAudios, ...list]);
    message.success(`替换成功！`);
  };

  // 替换bgm
  const bindReplaceAudio = (data: MultipleAudio, id: number) => {
    const result = replaceAudio(data, id);

    message.success(`替换成功！`);
    updateActiveAudio(result);
  };

  // 调整播放音量
  const bindSetVolume = (volume: number, id: number) => {
    setVolume(volume, id);
  };

  // 调整音频倍速
  const bindSetSpeed = (volume: number, id: number) => {
    setSpeed(volume, id);
  };

  const bindSetLoop = (loop: boolean, id: number) => {
    setLoop(loop, id);
  };
  const bindSetAudioDuration = (
    time: { startTime: number; endTime: number },
    id: number,
  ) => {
    const obj = { startTime: time.startTime, endTime: time.endTime };
    // console.log('time', obj, id);
    setAudioDuration(obj, id);
  };

  const bindSetAudioCut = (
    time: { startTime: number; endTime: number },
    id: number,
  ) => {
    setAudioCut(time, id);
  };

  const bindAddAudio = (data: AddAudioParams) => {
    const result = addAudio(data);
    message.success(`添加成功！`);

    updateActiveAudio({ ...result });
  };

  const bindRemoveAudio = (id: number) => {
    removeAudio(id);
    updateActiveAudio();
  };

  const newAudioList = JSON.parse(JSON.stringify(audioList));
  newAudioList.sort((a: MultipleAudio, b: MultipleAudio) => {
    return a.startTime - b.startTime; // 降序排列，return a-b; —>升序排列
  });

  return {
    bindReplaceAudio,
    audioList: newAudioList,
    bindSetVolume,
    bindSetSpeed,
    bindSetLoop,
    bindSetAudioDuration,
    bindSetAudioCut,
    bindAddAudio,
    bindRemoveAudio,
    bindSetBgAudios,
    BGMList,
  };
};
