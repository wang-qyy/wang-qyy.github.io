import assetHandler from '@kernel/store/assetHandler';
import audiosHandler from '@kernel/store/audioHandler';
import { useCreation } from 'ahooks';
import { MultipleAudio } from '@kernel/typing';
import { runInAction } from 'mobx';

export class AudioAdapter {
  index: number;

  constructor(index: number) {
    this.index = index;
  }

  loadSuccess = () => {
    const data = { rt_assetLoadComplete: true, rt_assetLoadFailed: false };
    audiosHandler.updateAudioStatus(data, this.index);
  };

  loadError = () => {
    const data = { rt_assetLoadComplete: true, rt_assetLoadFailed: true };
    audiosHandler.updateAudioStatus(data, this.index);
  };
}

export function useAudioAdapter(index: number) {
  return useCreation(() => new AudioAdapter(index), [index]);
}

export function setAudios(audios: MultipleAudio[]) {
  audiosHandler.setAudios(audios);
}

/**
 * @description 只有在单bgm时，添加模板删除模板会自动梳理单个gbm的endTime,如果用户调整过
 */
export function autoSetSingleBGMDuration() {
  const { BGMList = [] } = audiosHandler;
  const { allTemplateVideoTime: endTime } = assetHandler;

  runInAction(() => {
    BGMList[0].endTime = endTime;
  });
}

/**
 * @description 自动处理音频市场，超过模板自动过滤
 */
export function autoSetAudioDuration() {
  const {
    multiAudios = [],
    setEndTime,
    endTime: prevAllTemplateTime,
  } = audiosHandler;
  const { allTemplateVideoTime } = assetHandler;
  if (prevAllTemplateTime) {
    runInAction(() => {
      multiAudios.forEach((audio: MultipleAudio) => {
        const { endTime, startTime, cut = [0, 0], rt_duration } = audio;
        if (endTime >= prevAllTemplateTime || endTime >= allTemplateVideoTime) {
          // 如果模板时长调整以后，小于音频时长，则自动设置为模板时长
          // 但是不能小于音频的startTime
          const [cst, cet] = cut;

          let newEndTime = Math.max(allTemplateVideoTime, startTime + 1);
          // 能拖拽的最长时间，总时长，减去裁剪的时间
          const leftEndTime = rt_duration - cst + startTime;
          newEndTime = Math.ceil(Math.min(newEndTime, leftEndTime));
          const duration = newEndTime - startTime;

          audio.cut = [cst, cst + duration];
          audio.endTime = newEndTime;
        }
      });
    });
  }

  setEndTime(allTemplateVideoTime);
}
