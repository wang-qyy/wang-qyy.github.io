import { Asset, AssetClass } from '@kernel/typing';

/**
 * @description 初始化缓存组
 */
export function getTempModuleData() {
  const data = {
    meta: {
      type: '__module',
      index: -1,
      id: -1,
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
