import { action, computed, makeObservable, observable } from 'mobx';
import type { IObservableArray } from 'mobx';
import { reportChange } from '@kernel/utils/config';
import { AssetLoadType, MultipleAudio } from '@/kernel/typing';

class AudiosHandler {
  @observable multiAudios: IObservableArray<MultipleAudio> = observable.array(
    [],
  );

  @observable audioActive = -1;

  @observable endTime = 0;

  // 表示音频部分有没有被修改过 replaced 是跟后端约定字段
  @observable replaced = false;

  constructor() {
    makeObservable(this);
  }

  @computed
  get currentAudio() {
    if (this.audioActive > -1) {
      return this.multiAudios[this.audioActive];
    }
    return undefined;
  }

  @computed
  get BGMList() {
    if (this.multiAudios) {
      return this.multiAudios.filter((item) => item.type === 1);
    }
    return [];
  }

  @computed
  get audioList() {
    if (this.multiAudios) {
      return this.multiAudios.filter((item) => {
        // 如果音频的开始时间大于总视频时长，则忽略
        return item.type === 2 && item.startTime <= this.endTime;
      });
    }
    return [];
  }

  @computed
  get audiosLoaded() {
    if (this.multiAudios) {
      return this.multiAudios.every(
        (item) => item.rt_loadInfo.rt_assetLoadComplete,
      );
    }
    return true;
  }

  @computed
  get bgmLoaded() {
    if (this.multiAudios) {
      return this.BGMList.every(
        (item) => item.rt_loadInfo.rt_assetLoadComplete,
      );
    }
    return true;
  }

  @action
  setReplaced = (replaced: boolean) => {
    if (this.replaced !== replaced) this.replaced = replaced;
  };

  @action
  initAudioStatus = () => {
    this.multiAudios.clear();
    this.audioActive = -1;
  };

  @action
  setAudios = (audios: MultipleAudio[]) => {
    this.multiAudios.replace(audios);
  };

  @action
  setCurrentAudio = (index: number) => {
    if (this.multiAudios) {
      this.audioActive = index;
    }
  };

  @action
  setEndTime = (endTime: number) => {
    this.endTime = endTime;
  };

  @action
  addAudio = (audio: MultipleAudio) => {
    if (this.multiAudios) {
      this.multiAudios.push(audio);
      this.setReplaced(true);
      reportChange('addAudio');
    }
  };

  @action
  replaceAudio = (audio: MultipleAudio, index: number) => {
    if (this.multiAudios) {
      this.multiAudios.splice(index, 1, audio);
      this.setReplaced(true);
      reportChange('replaceAudio');
    }
  };

  @action
  removeAudio = (id: number) => {
    const index = this.multiAudios.findIndex((item) => item.rt_id === id);
    if (index > -1) {
      this.multiAudios.splice(index, 1);
      this.setReplaced(true);
      reportChange('removeAudio');
    }
  };

  @action
  updateAudio = (data: Partial<MultipleAudio>, index: number) => {
    const target = this.multiAudios[index];
    if (target) {
      Object.assign(target, data);
      // 修改音频持续时长时，需要清空缓存时长
      if (data.rt_endTime) {
        data.rt_endTime = undefined;
      }
      this.setReplaced(true);
      reportChange('updateAudio');
    }
  };

  @action
  audioIsUserControl = (index: number) => {
    const target = this.multiAudios[index];
    if (target && !target.rt_isUserControl) {
      Object.assign(target, {
        rt_isUserControl: true,
      });
    }
  };

  @action
  updateAudioStatus = (loadInfo: AssetLoadType, index: number) => {
    const target = this.multiAudios[index];
    if (target) {
      Object.assign(target, { rt_loadInfo: loadInfo });
    }
  };
}

export default new AudiosHandler();
