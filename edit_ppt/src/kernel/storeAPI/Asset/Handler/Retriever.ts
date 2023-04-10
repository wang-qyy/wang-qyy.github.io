import {
  setCurrentTemplateEndTime,
  getEditableAssetOnCurrentTime,
} from '@kernel/store';
import {
  buildPureTemplates,
  buildPureAsset,
} from '@kernel/utils/assetHelper/formater/dataBuilder';
import { isTempModuleType } from '@kernel/utils/assetChecker';

import { deepCloneJson } from '@kernel/utils/single';
import {
  assetHandler,
  getBackgroundAsset,
  getCurrentAsset,
  getTemplateIndexById,
  assetBlur,
  getEditAsset,
  getAllAsset,
  getMoveAssetMask,
  getCurrentCamera,
} from '@/kernel/store';
import { AssetClass } from '@/kernel';
import TemplateState from '@/kernel/store/assetHandler/template';
import { reportChange } from '@/kernel/utils/config';
import { setTemplate } from './TemplateHandler';

export const useGetBackgroundAsset = getBackgroundAsset;
export const useGetCurrentAsset = getCurrentAsset;
// 暴露业务层api
export {
  getTemplateIndexById,
  assetBlur,
  getAllAsset,
  getEditAsset,
  getMoveAssetMask,
  getCurrentAsset,
  getBackgroundAsset,
  getEditableAssetOnCurrentTime,
  getCurrentCamera,
};
/**
 * @description 获取多模板视频的播放总时长
 */
export function useAllTemplateVideoTimeByObserver() {
  const time = assetHandler.allTemplateVideoTime;
  return [time];
}

/**
 * @description 获取当前选中元素的拷贝值
 */
export function getCurrentAssetCopy() {
  const { active } = assetHandler;
  if (active) {
    // const copyAsset = active.getAssetCloned();
    // buildPureAsset(active);
    // return deepCloneJson(copyAsset);

    return active.getAssetCloned();
  }
  return undefined;
}

/**
 * @description 订阅当前编辑中的模板
 */
export function useCurrentTemplate() {
  const template = assetHandler.currentTemplate;

  return {
    template,
    setTemplate,
    removeTemplate: assetHandler.removeTemplate,
  };
}

/**
 * @description 过滤掉所有不可见的元素，只返回可见图层
 */
export function getLayerAssets(currentTemplate?: TemplateState) {
  const { assets = [], videoInfo = { offsetTime: [0, 0], pageTime: 0 } } =
    currentTemplate || assetHandler.currentTemplate || {};
  const { offsetTime = [0, 0], pageTime = 0 } = videoInfo;
  const [cs, ce] = offsetTime;

  return assets.filter((asset) => {
    const { meta, assetDuration } = asset;
    // TODO: 后面可能会去掉这个判断
    if (meta.type === 'effect') return;
    const { startTime, endTime } = assetDuration;
    const unVisibility =
      !isTempModuleType(asset) && !meta.isTransfer && !meta.isLogo;
    // 是否被裁减掉
    const inView =
      (startTime <= cs && endTime >= cs) ||
      (startTime >= cs && startTime < pageTime - ce);

    return unVisibility && inView;
  });
}

/**
 * @description 根据目标id获取模板
 * @param id
 */
export function getTargetTemplate(id: string | number) {
  return assetHandler.templates.filter((item) => item.id === id)[0];
}

/**
 * @description 获取所有模板的本地ID
 */
export function getTemplateIds() {
  return assetHandler.templates.map((item) => item.id);
}

export function getAllTemplates() {
  return assetHandler.templates;
}

/**
 * @description 在保存时，获取当前模板数据。后台发送数据时，需要做一些过滤处理
 */
export function getAllTemplatesWhenSave() {
  return buildPureTemplates(assetHandler.templates);
}

/**
 * @description 获取多模板视频的播放总时长
 */
export function getAllTemplateVideoTime() {
  return assetHandler.allTemplateVideoTime;
}

/**
 * @description 订阅当前选中模板的视频信息
 */
export function useCurrentTemplateVideoInfoByObserver() {
  const videoInfo = assetHandler?.currentTemplate?.videoInfo;

  return [videoInfo, setCurrentTemplateEndTime];
}

export function getCurrentTemplateIndex() {
  return assetHandler.currentTemplateIndex;
}

/**
 * @description 获取当前模板信息
 */
export function getCurrentTemplate() {
  return assetHandler.currentTemplate;
}

export function getMultiSelect() {
  return assetHandler.currentTemplate?.tempModule.assets;
}

/**
 * @description 获取当前正在操作的asset 需要搭配Observer使用
 */
export function useGetCurrentInfoByObserver() {
  return {
    // 如果选中的是
    currentAsset: assetHandler.active,
    moduleItemActive: assetHandler.moduleItemActive,
    tempModule: assetHandler.currentTemplate?.tempModule,
    multiSelect: getMultiSelect(),
  };
}

/**
 * @description 获取改元素的克隆数据
 * @param assetClass
 */
export function getAssetCloned(assetClass: AssetClass) {
  return assetClass.getAssetCloned();
}
