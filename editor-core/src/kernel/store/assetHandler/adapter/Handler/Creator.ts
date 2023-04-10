import {
  Assets,
  Asset,
  PageAttr,
  AssetClass,
  AddMaskParams,
} from '@kernel/typing';
import { assetHandler, historyRecord } from '@kernel/store';
import { newMask } from '@/kernel/utils/assetHelper/formater/dataBuilder';
import { getNewAssetPosition } from '../utils';

/**
 * @description 初始化元素列表
 * @param works
 * @param pageAttr
 */
export function initAssetWorks(works: Assets[], pageAttr: PageAttr) {
  if (works?.length) {
    historyRecord.initRecord();
    setTimeout(() => {
      assetHandler.setCurrentTemplate(0);
    });
  }
}

/**
 * @description 初始化缓存组
 */
export function getTempModuleData() {
  const data = {
    meta: {
      type: '__module',
      index: -1,
      id: -1,
      isQuickEditor: false,
      isAlwaysVisible: true,
    },
    attribute: {
      width: 0,
      height: 0,
      startTime: 0,
      endTime: 0,
    },
    transform: {
      posX: 0,
      posY: 0,
      zindex: -1,
      rotate: 0,
    },
  };
  return data as Asset;
}

/**
 * @description 初始化缓存组
 */
export function getModuleData(asset?: AssetClass | Asset) {
  const data = {
    meta: {
      type: 'module',
      index: -1,
      id: -1,
      isQuickEditor: false,
    },
    attribute: {
      width: 0,
      height: 0,
      startTime: 0,
      endTime: 0,
    },
    transform: {
      posX: 0,
      posY: 0,
      zindex: -1,
      rotate: 0,
    },
  };
  if (asset) {
    data.transform = {
      ...asset.transform,
    };
    data.attribute = {
      ...asset.attribute,
    };
  }
  return data as Asset;
}

/**
 * @description 添加蒙版元素
 * @param maskInfo
 */
export function addMaskAsset(maskInfo: AddMaskParams) {
  // @ts-ignore
  const asset = newMask() as Asset;

  // asset.meta.isUserAdd = true;
  Object.assign(asset.attribute, maskInfo.attribute);
  if (maskInfo.meta) {
    Object.assign(asset.meta, maskInfo.meta);
  }
  let transform;
  if (!maskInfo.transform) {
    transform = getNewAssetPosition(asset.attribute);
  } else {
    transform = maskInfo.transform;
  }

  Object.assign(asset.transform, transform);
  asset.assets = [];
  return assetHandler.currentTemplate.addAsset(asset);
}
