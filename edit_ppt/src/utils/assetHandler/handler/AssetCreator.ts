import { assetHandler } from '@kernel/store';
import { formatAsset } from '@kernel/utils/assetHelper/formater';

import { Asset, Attribute, Meta } from '@hc/editor-core';

import { getNewAssetPosition, getNewAssetDuration } from './init';
import { newMask } from './assetTemplate';
/**
 * @description 添加元素
 * @param asset
 * @param autoStartTime 自动设置startTime为currentTime
 */
function addAssetBefore(asset: Asset, autoStartTime = true) {
  if (autoStartTime) {
    const duration = getNewAssetDuration();
    Object.assign(asset.attribute, duration);
  }
  const newAsset = formatAsset(true, asset);

  asset.transform.zindex = Number(assetHandler.currentTemplate?.maxZIndex) + 1;
  return newAsset;
}

/**
 * @description 添加元素
 * @param asset
 * @param autoStartTime 自动设置startTime为currentTime
 */
export async function addAsset(asset: Asset, autoStartTime = true) {
  const newAsset = addAssetBefore(asset, autoStartTime);

  // await getAssetRtInfo(newAsset);
  const active = assetHandler?.currentTemplate?.addAsset(newAsset);

  return active;
}

export function addFontAsset() {}

export function addImageAsset() {}

export function addVideoEAsset() {}

export function addSVGAsset() {}

export function addLottieAsset() {}

export function AddVideoEParams() {}

export function AddImageParams() {}

export function addModule() {}
