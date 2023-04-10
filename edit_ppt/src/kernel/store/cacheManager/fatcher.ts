import { FormatData, replaceSvgModelPic } from '@kernel/utils/single';
import { config } from '@kernel/utils/config';
import WebFont from 'webfontloader';
import { getFontFamilyByFontName } from '@kernel/utils/defaultConfig';
import status, { DataCached, HasDataCached } from './index';

type Fetcher = (params: any) => Promise<any>;

function isLoadSucceed(status: { loaded: boolean; failed: boolean }) {
  return status.loaded && !status.failed;
}

export class CacheHelper {
  resources = new Map();

  fetcher: Fetcher;

  formatData: FormatData = (res) => {
    if (res.stat === 1) {
      return {
        data: res,
        cache: true,
      };
    }
    return {
      data: res,
      cache: false,
    };
  };

  constructor(fetcher: Fetcher, formatData?: FormatData) {
    this.fetcher = fetcher;
    if (formatData) {
      this.formatData = formatData;
    }
  }

  async fetch(cacheKey: number | string, params?: any): Promise<any> {
    try {
      const res = await this.fetcher(params);
      const { cache, data } = this.formatData(res);
      if (cache) {
        this.resources.set(cacheKey, data);
        return this.getData(cacheKey);
      }
      return data;
    } catch (error: any) {
      console.error('fetch error: ', error);
    }
  }

  /**
   *
   * @param cacheKey 一个用于缓存的key
   * @param params 参数
   */
  getData = async (cacheKey: number | string, params?: any): Promise<any> => {
    if (this.resources.has(cacheKey)) {
      return this.resources.get(cacheKey);
    }
    this.resources.set(cacheKey, this.fetch(cacheKey, params));
    return this.getData(cacheKey);
  };
}

/** 加载媒体素材 */
export function mediaLoader(src: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    fetch(src).then((response) => {
      try {
        const reader = response.body!.getReader();
        const stream = new ReadableStream({
          start() {
            function push() {
              reader.read().then(({ done }) => {
                if (done) {
                  resolve(true);
                  return;
                }
                push();
              });
            }

            push();
          },
        });
      } catch (e) {
        resolve(false);
      }
    });
  });
}

export async function getVideo(src: string) {
  if (status.videoCached[src]) {
    return true;
  }
  try {
    status.setDomCached('video', src);
    const result = await mediaLoader(src);
    status.setDomCached('video', src, result);
    return result;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function preGetVideo(src: string) {
  if (!status.videoCached[src]) {
    getVideo(src);
  }
}

export async function getAudio(src: string) {
  if (status.audioCached[src]) {
    return true;
  }
  try {
    status.setDomCached('audio', src);
    const result = await mediaLoader(src);
    status.setDomCached('audio', src, result);
    return result;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function preGetAudio(src: string) {
  if (!status.audioCached[src]) {
    getAudio(src);
  }
}

/** 加载媒体素材 */

/** 加载图片素材 */
export async function imageLoader(src: string): Promise<boolean> {
  const res = await fetch(src);
  return res.status === 200;
}

export async function getImage(src: string) {
  if (status.imageCached[src]) {
    return true;
  }
  try {
    status.setDomCached('image', src);
    const result = await mediaLoader(src);
    status.setDomCached('image', src, result);
    return result;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function preGetImage(src: string) {
  if (!status.imageCached[src]) {
    getImage(src);
  }
}

export function getFactory(
  cached: HasDataCached<any>,
  key: any,
  action: Promise<any>,
  dataFormat: (res: any) => any,
  resChecker: (res: any) => boolean,
) {
  const fetchAction = new Promise((resolve) => {
    action
      .then((res) => {
        if (resChecker(res)) {
          // replaceSvgModelPic 替换模板底图
          if (!isLoadSucceed(cached[key])) {
            status.setCached(cached, key, {
              status: true,
              data: dataFormat(res),
            });
          }
          resolve(dataFormat(res));
        } else {
          status.setCached(cached, key, {
            status: false,
          });
          resolve('');
        }
      })
      .catch(() => {
        status.setCached(cached, key, {
          status: false,
        });
        resolve('');
      });
  });
  status.setCached(cached, key, {
    action: fetchAction,
  });
}

/** 加载图片素材 */

/** 加载AEA */
export async function fetchAea(id: string | number) {
  const fetcher = await fetch(
    `${config.getApi('getAeAnimationDetail')}?id=${id}`,
    {
      credentials: 'include',
    },
  );
  return fetcher.json();
}

export async function getAea(id: string | number): Promise<any> {
  const { action } = status.aeACached[id] || {};
  if (action) {
    return action;
  }
  getFactory(
    status.aeACached,
    id,
    fetchAea(id),
    (res) => {
      const { data } = res;
      return {
        ...data,
        kw: JSON.parse(data.json_react),
        sort: Number(data.sort),
      };
    },
    (res) => true,
  );

  return getAea(id);
}

export function preGetAea(id: string | number) {
  if (!status.aeACached[id]) {
    getAea(id);
  }
}

/** 加载AEA */

/** 加载特效字数据 */
export async function fetchFontEffect(id: string | number) {
  const fetcher = await fetch(`${config.getApi('getSpecificWord')}?id=${id}`, {
    credentials: 'include',
  });
  return fetcher.json();
}
/** 加载花字数据 */
export async function fetchFontEffectColorful(id: string | number) {
  const fetcher = await fetch(`//js.xiudodo.com/colorful/presets/v2/${id}.json`)
    .then((response) => response.json())
    .then((res) => {
      return res;
    });
  return fetcher;
}
export function getFontEffect(id: string): Promise<any> {
  const { action } = status.fontEffectCached[id] || {};
  if (action) {
    return action;
  }
  getFactory(
    status.fontEffectCached,
    id,
    fetchFontEffect(id),
    (res) => res.msg,
    (res) => res.stat === 1 && res.msg,
  );

  return getFontEffect(id);
}
export function getFontEffectColorful(id: string): Promise<any> {
  const { action } = status.fontEffectColorfulCached[id] || {};
  if (action) {
    return action;
  }
  getFactory(
    status.fontEffectColorfulCached,
    id,
    fetchFontEffectColorful(id),
    (res) => res,
    (res) => !!res,
  );

  return getFontEffectColorful(id);
}
export function preGetFontEffect(id: string) {
  if (!status.fontEffectCached[id]) {
    getFontEffect(id);
  }
}

/** 加载AEA */

/** 加载SVG */
export async function fetchSVG(src: string): Promise<any> {
  if (process.env.NODE_ENV === 'development') {
    src = src.replace('https://xiudodo.com', '/mainHostApi');
  }

  const fetcher = await fetch(src, {
    credentials: 'include',
  });
  return fetcher.json();
}

export async function getSvg(src: string): Promise<string> {
  const { action } = status.svgCached[src] || {};
  if (action) {
    return action;
  }
  getFactory(
    status.svgCached,
    src,
    fetchSVG(src),
    (res) => replaceSvgModelPic(res.msg),
    (res) => res.stat === 1 && res.msg,
  );

  return getSvg(src);
}

export function preGetSvg(src: string) {
  if (!status.svgCached[src]) {
    getSvg(src);
  }
}

/** 加载SVG */

/** 加载lottie */
export async function fetchLottie(src: string): Promise<any> {
  const fetcher = await fetch(src);
  return fetcher.json();
}

export async function getLottie(src: string): Promise<any> {
  const { action } = status.lottieCached[src] || {};

  if (action) {
    return action;
  }
  getFactory(
    status.lottieCached,
    src,
    fetchLottie(src),
    (res) => res,
    (res) => !!res,
  );
  return getLottie(src);
}

export function preGetLottie(src: string) {
  if (!status.lottieCached[src]) {
    getLottie(src);
  }
}

/** 加载SVG */

/** 加载字体 */

function isFontLoaded(fontFamily: string): Promise<boolean> {
  return new Promise((resolve) => {
    WebFont.load({
      custom: {
        families: [fontFamily],
      },
      timeout: 60000,
      active: () => {
        resolve(true);
      },
      inactive: () => {
        resolve(false);
      },
    });
  });
}

/**
 *
 * @param fontFamily css样式 fontFamily 名称
 */
export async function getFontFamily(fontFamily: string) {
  const cache = status.fontFamilyCached[fontFamily];
  if (cache?.loaded) {
    return cache.loaded;
  }
  status.setFontFamilyCached(fontFamily);
  const result = await isFontLoaded(getFontFamilyByFontName(fontFamily));
  status.setFontFamilyCached(fontFamily, result);
  return result;
}

export function preGetFontFamily(fontFamily: string) {
  if (!status.fontFamilyCached[fontFamily]) {
    getFontFamily(fontFamily);
  }
}

/** 加载字体 */
