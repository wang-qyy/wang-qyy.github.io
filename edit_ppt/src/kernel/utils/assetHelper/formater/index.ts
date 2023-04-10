import {
  Asset,
  Audio,
  BaseMultipleAudio,
  CanvasInfo,
  SignatureEffect,
} from '@kernel/typing';
import { newId } from '@kernel/utils/idCreator';
import {
  absoluteMaskToRelativeMask,
  containerToMask,
} from '@kernel/utils/assetHelper/formater/dataBuilder';
import {
  formatEffectWordInerColor,
  formatFillsData,
} from '@/kernel/storeAPI/Asset/Handler/effectWordUtil';
import { AEA_KEYS } from '@kernel/store/assetHandler/asset/const';
import { isMaskType } from '../../assetChecker';
import { deepCloneJson } from '../../single';
import { CacheImage } from '../../cacheImage';

/**
 * @description 确定必传值是否存在，否则给予默认值
 * @param asset
 */
function checkAssetRequestData(asset: Asset) {
  const { meta, attribute, transform } = asset;
  if (meta.type === 'text' && attribute.textAlign === undefined) {
    attribute.textAlign = 'center';
  }
  if (attribute.width === undefined) {
    attribute.width = 0;
  }
  if (attribute.height === undefined) {
    attribute.height = 0;
  }
  if (attribute.startTime === undefined) {
    attribute.startTime = 0;
  }
  if (
    attribute.endTime === undefined ||
    attribute.endTime <= attribute.startTime
  ) {
    attribute.endTime = attribute.startTime + 100;
  }
  if (transform.posX === undefined) {
    transform.posX = 0;
  }
  if (transform.posY === undefined) {
    transform.posY = 0;
  }

  if (attribute.aeA) {
    Object.keys(attribute.aeA).forEach((aeAKey) => {
      const aeA = attribute.aeA[aeAKey];
      if (aeA.pbr < 0 || aeA.pbr === null) {
        aeA.pbr = 1;
      }
    });
  }
}
/**
 * @description 格式化新版数据结构
 * @param isInit 是否是初始化的数据，初始化数据需要进行一些特殊操作，否则只会过重置辅助属性
 * @param asset 元素体
 */
export function formatAsset(isInit: boolean, asset: Asset) {
  const { meta, attribute, transform } = asset;
  checkAssetRequestData(asset);
  if (attribute.container) {
    asset = containerToMask(asset);
  }
  if (meta.type === 'text') {
    if (attribute.effect === '') {
      delete attribute.effect;
      delete attribute.effectVariant;
    }
  }
  if (isMaskType(asset)) {
    asset = absoluteMaskToRelativeMask(asset);
  }
  if (attribute.resId) {
    attribute.originResId = attribute.resId;
  }
  const { aeA } = asset.attribute;
  if (aeA) {
    AEA_KEYS.forEach((key) => {
      const aeaItem = aeA[key];
      if (aeaItem.kw && typeof aeaItem.kw === 'string') {
        aeaItem.kw = JSON.parse(aeaItem.kw);
      }
    });
    asset = absoluteMaskToRelativeMask(asset);
  }
  if (asset.assets) {
    asset.assets = asset.assets.map((item) => formatAsset(isInit, item));
  }
  return asset;
}
/**
 * @description 确定必传值是否存在，否则给予默认值
 * @param audio
 */
function checkAudioRequestData(audio: Audio | BaseMultipleAudio) {
  if (audio.startTime === undefined) {
    audio.startTime = 0;
  }
  if (audio.endTime === undefined) {
    audio.endTime = 1;
  }
}

export function formatAudio(audio: Audio | BaseMultipleAudio) {
  checkAudioRequestData(audio);
  return {
    ...audio,
    rt_id: newId(),
    rt_loadInfo: {
      rt_assetLoadComplete: false,
      rt_assetLoadFailed: false,
    },
  };
}

/**
 * 格式化花字数据
 */
export function formatEffectColorData(effect: SignatureEffect) {
  if (effect) {
    const { sourceList } = effect;
    let deepCloneEffect = deepCloneJson(effect);
    // 对花字的颜色进行关联性分组

    deepCloneEffect = formatEffectWordInerColor(deepCloneEffect); // 对花字的填充数据进行处理
    deepCloneEffect = formatFillsData(deepCloneEffect); // 如果有图片填充的数据对图片进行预加载缓存图片
    if (sourceList.length > 0) {
      const cacheDImg: any[] = [];
      const imgCache = new CacheImage('effectImage');
      sourceList.forEach((element) => {
        // @ts-ignore
        const res = imgCache.getImageDom(element);
        cacheDImg.push(res);
      });
    }
    return deepCloneEffect;
  }
}
export function formatCanvasInfoScale(canvasInfo: CanvasInfo) {
  return {
    ...canvasInfo,
    scale: Math.ceil(canvasInfo.scale * 100) / 100,
  };
}
