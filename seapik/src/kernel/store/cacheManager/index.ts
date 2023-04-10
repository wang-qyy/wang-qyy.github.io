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
export type LottieCachedCached = HasDataCached<any>;

class CacheStatus {
  // 是否可以开始检测元素加载状态
  @observable templateInitOver = true;

  videoStores: Record<string, HTMLVideoElement> = {};

  @observable imageCached: BaseCached = {};

  @observable fontFamilyCached: BaseCached = {};

  @observable svgCached: SvgCached = {};

  @observable lottieCached: LottieCachedCached = {};

  @observable fontEffectCached: FontEffectCached = {};

  loadedKeys = [
    'imageLoaded',
    'fontFamilyLoaded',
    'lottieLoaded',
    'svgLoaded',
    'fontEffectLoaded',
  ];

  loadCachedStateMap = {
    imageCached: 'imageLoaded',
    fontFamilyCached: 'fontFamilyLoaded',
    lottieCached: 'lottieLoaded',
    svgCached: 'svgLoaded',
    fontEffectCached: 'fontEffectLoaded',
  };

  @computed
  get imageLoaded() {
    return this.loadTest(this.imageCached);
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
  get lottieLoaded() {
    return this.loadTest(this.lottieCached);
  }

  @computed
  get fontEffectLoaded() {
    return this.loadTest(this.fontEffectCached);
  }

  @computed
  get allLoaded() {
    if (this.templateInitOver) {
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
  setDomCached = (type: 'image', key: string, status?: boolean) => {
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
  setLottieCached = (key: string, params?: DataCachedParams) => {
    this.setCached(this.lottieCached, key, params);
  };

  @action
  setTemplateInitOver = (status: boolean) => {
    this.templateInitOver = status;
  };
}

export default new CacheStatus();
