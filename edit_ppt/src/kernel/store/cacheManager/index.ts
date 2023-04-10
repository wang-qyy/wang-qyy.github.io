// @ts-nocheck
import { action, computed, makeObservable, observable } from 'mobx';

export interface LoadStatus {
  loaded: boolean;
  failed: boolean;
}

export interface BaseCached {
  [key: string]: LoadStatus;
}

export interface DataCachedParams<T> {
  status?: boolean;
  action?: Promise<T>;
  data?: T;
}

export interface DataCached<T> {
  loaded: boolean;
  failed: boolean;
  action?: Promise<T>;
  data?: T;
}

export interface HasDataCached<T> {
  [key: string]: DataCached<T>;
}

export type SvgCached = HasDataCached<string>;
export type AeACached = HasDataCached<any>;
export type FontEffectCached = HasDataCached<any>;
export type FontEffecttColorfulCached = HasDataCached<any>;
export type LottieCachedCached = HasDataCached<any>;

class CacheStatus {
  // 是否可以开始检测元素加载状态
  @observable templateInitOver = true;

  videoStores: Record<string, HTMLVideoElement> = {};

  // 是否可以开始检测音频加载状态
  @observable audioInitOver = true;

  @observable videoCached: BaseCached = {};

  @observable imageCached: BaseCached = {};

  @observable audioCached: BaseCached = {};

  @observable fontFamilyCached: BaseCached = {};

  @observable svgCached: SvgCached = {};

  @observable aeACached: AeACached = {};

  @observable lottieCached: LottieCachedCached = {};

  @observable fontEffectCached: FontEffectCached = {};

  @observable fontEffectColorfulCached: FontEffecttColorfulCached = {};

  loadedKeys = [
    'videoLoaded',
    'imageLoaded',
    'audioLoaded',
    'fontFamilyLoaded',
    'lottieLoaded',
    'svgLoaded',
    'aeALoaded',
    'fontEffectLoaded',
    'fontEffectColorfulLoaded',
  ];

  loadCachedStateMap = {
    videoCached: 'videoLoaded',
    imageCached: 'imageLoaded',
    audioCached: 'audioLoaded',
    fontFamilyCached: 'fontFamilyLoaded',
    lottieCached: 'lottieLoaded',
    svgCached: 'svgLoaded',
    aeACached: 'aeALoaded',
    fontEffectCached: 'fontEffectLoaded',
    fontEffectColorfulCached: 'fontEffectColorfulLoaded',
  };

  @computed
  get videoLoaded() {
    return this.loadTest(this.videoCached);
  }

  @computed
  get imageLoaded() {
    return this.loadTest(this.imageCached);
  }

  @computed
  get audioLoaded() {
    return this.loadTest(this.audioCached);
  }

  @computed
  get fontFamilyLoaded() {
    return this.loadTest(this.fontFamilyCached);
  }

  @computed
  get svgLoaded() {
    return this.loadTest(this.svgCached);
  }

  @computed
  get aeALoaded() {
    return this.loadTest(this.aeACached);
  }

  @computed
  get lottieLoaded() {
    return this.loadTest(this.lottieCached);
  }

  @computed
  get fontEffectLoaded() {
    return this.loadTest(this.fontEffectCached);
  }
  @computed
  get fontEffectColorfulLoaded() {
    return this.loadTest(this.fontEffectColorfulCached);
  }
  @computed
  get allLoaded() {
    // const {
    //   videoLoaded,
    //   imageLoaded,
    //   audioLoaded,
    //   fontFamilyLoaded,
    //   svgLoaded,
    //   aeALoaded,
    //   fontEffectLoaded,
    //   lottieLoaded,
    // } = this;
    // console.log({
    //   videoLoaded,
    //   imageLoaded,
    //   audioLoaded,
    //   fontFamilyLoaded,
    //   svgLoaded,
    //   aeALoaded,
    //   fontEffectLoaded,
    //   lottieLoaded,
    // });
    // return videoLoaded && imageLoaded && audioLoaded && fontFamilyLoaded && svgLoaded && aeALoaded && fontEffectLoaded;
    // 如果元素添加完毕，则开始检测元素load情况

    if (this.templateInitOver && this.audioInitOver) {
      // @ts-ignore
      return this.loadedKeys.every((key) => this[key]);
    }
    return false;
  }

  constructor() {
    makeObservable(this);
  }

  loadTest = (data: any) => {
    return Object.keys(data).every((key) => {
      return data[key].loaded;
    });
  };

  getStatus = (status?: boolean) => {
    if (typeof status !== 'boolean') {
      return {
        loaded: false,
        failed: false,
      };
    }
    return {
      loaded: true,
      failed: !status,
    };
  };

  @action
  setFontFamilyCached = (key: string, status?: boolean) => {
    const target = this.fontFamilyCached[key];
    if (!target?.loaded) {
      this.fontFamilyCached[key] = this.getStatus(status);
    }
  };

  @action
  setDomCached = (
    type: 'video' | 'audio' | 'image',
    key: string,
    status?: boolean,
  ) => {
    const targetDom = this[`${type}Cached`];
    if (!targetDom[key]?.loaded) {
      targetDom[key] = this.getStatus(status);
    }
  };

  @action
  setCached = <T>(cached: any, key: any, params?: DataCachedParams<T> = {}) => {
    if (!cached[key]) {
      cached[key] = {};
    }
    const target = cached[key];
    if (!target?.loaded) {
      const data = this.getStatus(params.status);
      Object.assign(target, data);

      if (params.action) {
        target.action = params.action;
      }
      if (params.data) {
        target.data = params.data;
      }
      if (data.failed) {
        target.data = undefined;
      }
    }
  };

  @action
  setSVGCached = (key: string, params?: DataCachedParams) => {
    this.setCached(this.svgCached, key, params);
  };

  @action
  setAEACached = (key: string, params?: DataCachedParams) => {
    this.setCached(this.aeACached, key, params);
  };

  @action
  setFontEffectCached = (key: string, params?: DataCachedParams) => {
    this.setCached(this.fontEffectCached, key, params);
  };
  @action
  setFontEffectColorfulCached = (key: string, params?: DataCachedParams) => {
    this.setCached(this.fontEffectColorfulCached, key, params);
  };
  @action
  setLottieCached = (key: string, params?: DataCachedParams) => {
    this.setCached(this.lottieCached, key, params);
  };

  @action
  setTemplateInitOver = (status: boolean) => {
    this.templateInitOver = status;
  };

  @action
  setAudioInitOver = (status: boolean) => {
    this.audioInitOver = status;
  };
}

export default new CacheStatus();
