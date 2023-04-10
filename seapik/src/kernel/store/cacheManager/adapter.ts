import { deepCloneJson, replaceSvgModelPic } from '@kernel/utils/single';
import { runInAction, toJS } from 'mobx';
import { Asset } from '@/kernel';
import { getFontFamily, getImage, getLottie, getSvg } from './fetcher';
import status from './index';
import { backupFontFamily } from '@kernel/utils/defaultConfig';

export const useTemplateLoaded = () => {
  return status.allLoaded;
};
export const useFontFamilyLoaded = (fontFamily?: string) => {
  if (!fontFamily) {
    return false;
  }
  return !!status.fontFamilyCached?.[fontFamily]?.loaded;
};

export const setTemplateInitOver = (result: boolean) => {
  status.setTemplateInitOver(result);
};

export function getSvgSync(source_key: string) {
  const target = status.svgCached[source_key].data;
  return deepCloneJson(target);
}

export function getFontEffectSync(id: string) {
  if (!id) return;
  const target = status.fontEffectCached[id].data;
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

/**
 * @description
 */
export function whoIsNotLoaded() {
  const {
    loadCachedStateMap,
    imageLoaded,
    fontFamilyLoaded,
    svgLoaded,
    fontEffectLoaded,
    lottieLoaded,
  } = status;
  console.log('load status', {
    imageLoaded,
    fontFamilyLoaded,
    svgLoaded,
    fontEffectLoaded,
    lottieLoaded,
  });
  let allLoaded = true;
  Object.keys(loadCachedStateMap).forEach((cached) => {
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

      if (!attribute.fontFamily) {
        // 默认字体
        await getFontFamily(backupFontFamily);
        runInAction(() => {
          attribute.fontFamily = backupFontFamily;
        });
      }

      break;
    case 'image':
      if (attribute.mask) {
        const { source_key, rt_svgString } = attribute.mask;
        if (source_key && !rt_svgString) {
          const svgString = await getSvg(source_key);
          // 替换svg的模板图片链接
          runInAction(() => {
            Object.assign(attribute, {
              mask: {
                rt_svgString: replaceSvgModelPic(svgString),
                source_key: source_key,
              },
            });
          });
        }
      }
      if (attribute.picUrl) {
        await getImage(attribute.picUrl);
      }
      break;
    case 'mask':
      if (attribute.source_key && !attribute.rt_svgString) {
        const svgString = await getSvg(attribute.source_key);
        // 替换svg的模板图片链接
        runInAction(() => {
          Object.assign(attribute, {
            mask: {
              rt_svgString: replaceSvgModelPic(svgString),
              source_key: attribute.source_key,
            },
          });
        });
      }
      break;
  }
}
