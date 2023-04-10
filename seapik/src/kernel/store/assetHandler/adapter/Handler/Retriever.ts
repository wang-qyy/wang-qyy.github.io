import assetHandler from '@kernel/store/assetHandler';
import global from '@kernel/store/global';
import { Asset, AssetClass, TemplateBackground } from '@kernel/typing';
import { config } from '@kernel/utils/config';
import { isMaskType } from '@kernel/utils/assetChecker';
import AssetItemState from '../../asset';

export function getAllAsset() {
  return assetHandler?.assets || [];
}
export const getCanvasStatus = () => {
  return assetHandler?.status;
};
/**
 * @description 获取当前hover的元素
 */
export const getHoverAsset = () => {
  return assetHandler?.hoverActive;
};
/**
 * @description 获取拖拽中的元素
 */
export const getMoveAsset = () => {
  return assetHandler?.moveActive;
};
/**
 * @description 获取编辑中的元素
 */
export const getEditAsset = () => {
  return assetHandler?.active;
};
/**
 * @description 获取蒙版中拖拽中的元素
 */
export const getMoveAssetMask = () => {
  return assetHandler?.moveActiveMask;
};
/**
 * @description 获取编辑中的元素
 */
export const getCurrentAsset = () => {
  return assetHandler?.currentAsset;
};

/**
 * @description 获取当前文字编辑中的元素
 */
export const getTextEditAsset = () => {
  return assetHandler?.textEditActive;
};
export const getAssetStatus = () => {
  return assetHandler.status;
};
export const getClippingAsset = () => {
  if (assetHandler.status.inClipping) {
    return assetHandler.active;
  }
  return undefined;
};

/**
 * 获取替换元素元素
 */
export function useGetReplacingAsset() {
  if (assetHandler.status.inReplacing) {
    return assetHandler.active;
  }
  return undefined;
}

/**
 * @description 获取辅助线命中的元素索引列表
 */
export const getAuxiliaryTargetIndex = () => {
  return assetHandler.auxiliaryTargetIndex;
};
/**
 * @description 获取辅助线命中的元素索引列表
 */
export const getHighlightAssets = () => {
  return assetHandler.highlightAssets;
};

/**
 * @description 获取辅助线命中的元素索引列表
 */
export const getMultiSelect = () => {
  return assetHandler?.currentTemplate?.tempModule.assets || [];
};
/**
 * @description 获取辅助线命中的元素索引列表
 */
export const getModuleItemActive = () => {
  return assetHandler.moduleItemActive;
};

export function getAssetIndexById(id: number) {
  const { assets = [] } = assetHandler;
  return assets.findIndex((item) => item.meta.id === id);
}

export function getTemplateBackground() {
  return assetHandler.currentTemplateBackground as TemplateBackground;
}

export function getTemplateVideoInfo() {
  return assetHandler.currentTemplateVideoInfo;
}

export function getCurrentTemplate() {
  return assetHandler.currentTemplate;
}
// 获取当前片段的上一个片段数据
export function getPreTemplate() {
  const { currentTemplateIndex, templates } = assetHandler;
  if (currentTemplateIndex === 0) {
    return undefined;
  }
  return templates[currentTemplateIndex - 1];
}

export function getCurrentTemplateIndex() {
  return assetHandler.currentTemplateIndex;
}

export function getTemplate(id?: number | string) {
  if (id) {
    const index = assetHandler.templates.findIndex((item) => item.id === id);
    return {
      template: assetHandler.templates[index],
      index,
    };
  }
  return {
    template: assetHandler.currentTemplate,
    index: assetHandler.currentTemplateIndex,
  };
}

/**
 * @description 获取元素列表
 */
export function getAssetList() {
  return assetHandler.assets;
}

/**
 * @description 获取所有元素
 */
export function getTemplateList() {
  return [...assetHandler.templates];
}

/**
 * @description 获取所有元素
 */
export function getTimeScale() {
  return assetHandler.timeScale;
}

/**
 * @description 获取元素加载状态
 */
export function getAssetLoading() {
  return assetHandler.assetLoaded;
}

/**
 * @description 获取辅助线命中的元素索引列表
 */
export const useGetAuxiliaryTargetIndex = () => {
  return assetHandler.auxiliaryTargetIndex;
};
/**
 * @description 获取辅助线命中的元素索引列表
 */
export const useGetHighlightAssets = () => {
  return assetHandler.highlightAssets;
};

/**
 * @description 获取辅助线命中的元素索引列表
 */
export const useGetMultiSelect = () => {
  return assetHandler?.currentTemplate?.tempModule.assets || [];
};
/**
 * @description 获取辅助线命中的元素索引列表
 */
export const useGetModuleItemActive = () => {
  return assetHandler.moduleItemActive;
};

/**
 * @description 获取当前帧下的可编辑元素
 * @param currentTime
 */
export function getEditableAssetOnCurrentTime(currentTime?: number) {
  const { assets, currentTemplate } = assetHandler;
  if (currentTemplate && currentTemplate?.videoInfo) {
    const { videoStatus, currentTimeRange } = global;
    let targetTime =
      typeof currentTime === 'number' ? currentTime : videoStatus.currentTime;

    if (config.wholeTemplate) {
      targetTime -= currentTimeRange;
    }

    return assets.filter((asset: AssetClass) => {
      // 锁定元素，与背景元素不可框选
      if (!asset.meta.locked && !asset.meta.isBackground) {
        return true;
      }
      return false;
    });
  }
  return [];
}

const loopGroup = (assets: AssetItemState[]) => {
  const list: AssetItemState[] = [];
  assets.forEach((asset) => {
    // const realAsset = getRealAsset(asset);
    const { type } = asset.meta;
    if (type === 'module' && asset.assets.length) {
      list.push(...loopGroup(asset.assets));
    }
    if (['image', 'SVG', 'svgPath', 'mask', 'lottie'].includes(type)) {
      list.push(asset);
    }
  });
  return list;
};

/**
 * @description 获取蒙版中拖拽中的元素
 */
export const useGetMoveAssetMask = () => {
  return assetHandler?.moveActiveMask;
};

export function getBackgroundAsset() {
  return assetHandler?.currentTemplate?.backgroundAsset;
}

export function useSubscribeAssets(assetIds?: number[]) {
  const { assets = [] } = assetHandler;
  if (assetIds) {
    return assets.filter((item) => assetIds.includes(item.meta.id));
  }
  return assets;
}

/**
 * 获取当前被hover的蒙版元素
 */
export function getCurrentHoverMask() {
  const list = getEditableAssetOnCurrentTime();
  return list.filter(
    (item) => isMaskType(item) && item.tempData.rt_hover?.isHover,
  );
}
