import { Asset, CanvasInfo } from '@kernel/typing';
import {
  absoluteMaskToRelativeMask,
  containerToMask,
} from '@kernel/utils/assetHelper/formater/dataBuilder';

import { isMaskType } from '../../assetChecker';

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
}
/**
 * @description 格式化新版数据结构
 * @param isInit 是否是初始化的数据，初始化数据需要进行一些特殊操作，否则只会过重置辅助属性
 * @param asset 元素体
 */
export function formatAsset(isInit: boolean, asset: Asset) {
  const { attribute } = asset;
  checkAssetRequestData(asset);
  if (attribute.container) {
    asset = containerToMask(asset);
  }

  if (isMaskType(asset)) {
    asset = absoluteMaskToRelativeMask(asset);
  }

  if (asset.assets) {
    asset.assets = asset.assets.map((item) => formatAsset(isInit, item));
  }
  return asset;
}

export function formatCanvasInfoScale(canvasInfo: CanvasInfo) {
  return {
    ...canvasInfo,
    scale: Math.ceil(canvasInfo.scale * 100) / 100,
  };
}
