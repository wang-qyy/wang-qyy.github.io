import { buildPureTemplates } from '@kernel/utils/assetHelper/formater/dataBuilder';

import {
  assetHandler,
  getBackgroundAsset,
  getCurrentAsset,
  assetBlur,
  getEditAsset,
  getAllAsset,
  getMoveAssetMask,
} from '@/kernel/store';
import { AssetClass } from '@/kernel';
import { setTemplate } from './TemplateHandler';

export const useGetBackgroundAsset = getBackgroundAsset;
export const useGetCurrentAsset = getCurrentAsset;
// 暴露业务层api
export {
  assetBlur,
  getAllAsset,
  getEditAsset,
  getMoveAssetMask,
  getCurrentAsset,
  getBackgroundAsset,
};

/**
 * @description 获取当前选中元素的拷贝值
 */
export function getCurrentAssetCopy() {
  const { active } = assetHandler;
  if (active) {
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
