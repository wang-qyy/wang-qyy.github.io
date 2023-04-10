import { deepCloneJson, replaceSvgModelPic } from '@kernel/utils/single';
import { runInAction, toJS } from 'mobx';
import { Asset, AssetClass } from '@/kernel';
import { getFontEffectId } from '@kernel/utils/StandardizedTools';
import { FontEffect } from '@kernel/store/assetHandler/utils';
import { AEA_KEYS } from '@kernel/utils/assetHelper/const';
import { containerToMask } from '@kernel/utils/assetHelper/formater/dataBuilder';
import { formatEffectColorData } from '@/kernel/storeAPI';
import { CacheImage } from '@/kernel/utils/cacheImage';
import {
  getAea,
  getFontEffect,
  getFontEffectColorful,
  getFontFamily,
  getImage,
  getLottie,
  getSvg,
  getVideo,
} from './fatcher';
import status from './index';

export const useTemplateLoaded = () => {
  return status.allLoaded;
};
export const useFontFamilyLoaded = (fontFamily?: string) => {
  if (!fontFamily) {
    return false;
  }
  return !!status.fontFamilyCached?.[fontFamily]?.loaded;
};

export const setAudioInitOver = (result: boolean) => {
  status.setAudioInitOver(result);
};

export const setTemplateInitOver = (result: boolean) => {
  status.setTemplateInitOver(result);
};

export function getAeaSync(id: string) {
  const target = status.aeACached[id].data;
  return deepCloneJson(target);
}

export function getSvgSync(source_key: string) {
  const target = status.svgCached[source_key].data;
  return deepCloneJson(target);
}

export function getFontEffectSync(id: string) {
  if (!id) return;
  const target = status.fontEffectCached[id].data;
  return deepCloneJson(target);
}
export function getFontEffectColorfulSync(id: string) {
  if (!id) return;
  const target = status.fontEffectColorfulCached[id].data;
  return deepCloneJson(target);
}
export function getLottieSync(src: string) {
  const target = status.lottieCached[src].data;
  return deepCloneJson(target);
}

export function loadImage(src: string, result?: boolean) {
  if (!src || (status.imageCached[src] && typeof result !== 'boolean')) {
    return false;
  }
  status.setDomCached('image', src, result);
}

export function loadVideo(src: string, result?: boolean) {
  if (!src || (status.videoCached[src] && typeof result !== 'boolean')) {
    return false;
  }
  status.setDomCached('video', src, result);
}

export function loadAudio(src: string, result?: boolean) {
  if (!src || (status.audioCached[src] && typeof result !== 'boolean')) {
    return false;
  }
  status.setDomCached('audio', src, result);
}

/**
 * @description
 */
export function whoIsNotLoaded() {
  const {
    loadCachedStateMap,
    videoLoaded,
    imageLoaded,
    audioLoaded,
    fontFamilyLoaded,
    svgLoaded,
    aeALoaded,
    fontEffectLoaded,
    lottieLoaded,
  } = status;
  console.log('load status', {
    videoLoaded,
    imageLoaded,
    audioLoaded,
    fontFamilyLoaded,
    svgLoaded,
    aeALoaded,
    fontEffectLoaded,
    lottieLoaded,
  });
  let allLoaded = true;
  Object.keys(loadCachedStateMap).forEach(cached => {
    // @ts-ignore
    const loaded = loadCachedStateMap[cached];
    // @ts-ignore
    if (!status[loaded]) {
      console.warn(`%c ${cached}`, 'color:origin;font-size:14px');
      // @ts-ignore
      for (const item in status[cached]) {
        // @ts-ignore
        const target = status[cached][item];
        if (!target?.loaded) {
          if (allLoaded) {
            allLoaded = false;
          }
          console.log(cached, { key: item, ...toJS(target) });
        }
      }
    }
  });
  if (allLoaded) {
    console.log('%c All assets loaded', 'color:green;font-size:20px');
  }
}

/**
 * 加载图层的rt属性 lottie,svg
 * @param asset
 * @param isInit
 */
export async function getAssetRtInfo(asset: Asset, isInit = false) {
  const { meta, attribute } = asset;
  switch (meta.type) {
    case 'SVG':
      if (attribute.source_key) {
        if (!(isInit && attribute.rt_svgString)) {
          const svgString = await getSvg(attribute.source_key);
          // 替换svg的模板图片链接
          runInAction(() => {
            attribute.rt_svgString = replaceSvgModelPic(svgString);
          });
        }
      }
      break;
    case 'video':
    case 'videoE':
      if (attribute.rt_url) {
        await getVideo(attribute.rt_url);
      }
      break;
    case 'lottie':
      if (attribute.rt_url) {
        await getLottie(attribute.rt_url);
        runInAction(() => {
          attribute.rt_lottieLoaded = true;
        });
      }
      break;
    case 'text':
      // 字体优先级==>attribute.fontFamily>effectVariant.rt_defaultFontFamily>默认字体
      if (attribute.fontFamily) {
        await getFontFamily(attribute.fontFamily);
      }
      // 特效字的处理
      if (attribute.effect) {
        const id = getFontEffectId(attribute.effect);
        const effectVariant = await getFontEffect(id);
        if (!attribute.effectVariant) {
          runInAction(() => {
            attribute.effectVariant = {
              ...effectVariant,
              variableColorPara:
                FontEffect.filterFontEffectColor(effectVariant) ?? [],
            };
          });
        }
        // 赋值特效字的变量设置数据以及rt_name
        if (attribute.effectVariant && effectVariant) {
          runInAction(() => {
            // @ts-ignore
            attribute.effectVariant = {
              ...attribute.effectVariant,
              // 赋值特效字的变量设置数据以及rt_name
              rt_name: effectVariant.rt_name,
              rt_variantColors: effectVariant.rt_variantColors,
              rt_variantList: effectVariant.rt_variantList,
              rt_variantNames: effectVariant.rt_variantNames,
            };
          });
        }
        if (effectVariant.rt_defaultFontFamily && !attribute.fontFamily) {
          runInAction(() => {
            attribute.fontFamily = effectVariant.rt_defaultFontFamily;
          });
          await getFontFamily(effectVariant.rt_defaultFontFamily);
        }
        // 添加特效字时  如果特效字有默认颜色 赋值给图层颜色
        // if (effectVariant.rt_defaultFontColor) {
        //   attribute.color = effectVariant.rt_defaultFontColor;
        // }
      }
      if (!attribute.fontFamily) {
        // 默认字体
        await getFontFamily('fnsyhtRegular');
        runInAction(() => {
          attribute.fontFamily = 'fnsyhtRegular';
        });
      }
      // 花字的处理
      if (attribute?.effectColorful && !attribute?.effectColorful?.effect) {
        const effect = await getFontEffectColorful(
          attribute?.effectColorful.resId,
        );
        if (effect?.sourceList) {
          effect?.sourceList.forEach(async item => {
            await new CacheImage('effectColorfulImage').getImageDom(item);
          });
        }
        attribute.effectColorful.effect = effect;
      }

      break;
    case 'pic':
    case 'background':
    case 'image':
      if (attribute.picUrl) {
        await getImage(attribute.picUrl);
      }
      break;
    case 'mask':
      if (attribute.source_key && !attribute.rt_svgString) {
        const svgString = await getSvg(attribute.source_key);
        // 替换svg的模板图片链接
        runInAction(() => {
          attribute.rt_svgString = replaceSvgModelPic(svgString);
        });
      }
      break;
  }

  if (attribute.aeA) {
    const action: Array<Promise<any>> = [];
    AEA_KEYS.forEach(key => {
      const current = attribute.aeA![key];
      if (!current) return;
      if (isInit) {
        if (current.resId) {
          action.push(
            getAea(current.resId).then(res => {
              const { kw } = res;
              runInAction(() => {
                current.kw = deepCloneJson(kw);
              });
            }),
          );
        }
      } else {
        if (current.resId && !current.kw) {
          action.push(
            getAea(current.resId).then(res => {
              const { kw } = res;
              runInAction(() => {
                current.kw = deepCloneJson(kw);
              });
            }),
          );
        }
        if (current.kw && typeof current.kw === 'string') {
          runInAction(() => {
            // @ts-ignore
            current.kw = JSON.parse(current.kw);
          });
        }
      }
    });
    await Promise.all(action);
  }
}
