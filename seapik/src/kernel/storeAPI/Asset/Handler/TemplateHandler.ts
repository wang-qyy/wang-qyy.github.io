import { reportChange, config } from '@kernel/utils/config';
import assetHandler from '@kernel/store/assetHandler';
import global from '@kernel/store/global';

import { newTemplate, newAssetTemplate } from '@kernel/utils/assetTemplate';
import { runInAction } from 'mobx';

import {
  Asset,
  RawTemplateData,
  Attribute,
  AssetType,
  TemplateClass,
  AssetClass,
  LogoType,
} from '@kernel/typing';

import { formatRawTemplateData } from '@kernel/utils/assetHelper/formater/dataBuilder';

import { getNewAssetPosition } from '@kernel/storeAPI/Asset/utils';
import AssetItemState from '@kernel/store/assetHandler/asset';
import TemplateState from '@/kernel/store/assetHandler/template';

export interface AddLottieParams {
  meta: {
    type: 'lottie';
    isBackground?: boolean;
  };
  attribute: {
    resId: Attribute['resId'];
    rt_url: Attribute['rt_url'];
    rt_preview_url: Attribute['rt_preview_url'];
    width: Attribute['width'];
    height: Attribute['height'];
    picUrl: Attribute['picUrl'];
    rt_total_time: Attribute['rt_total_time'];
    rt_total_frame: Attribute['rt_total_frame'];
    totalTime: Attribute['totalTime'];
  };
  transform?: {
    posX: number;
    posY: number;
  };
}

/**
 * @description 给模板注入logo元素
 * @param template
 * @param asset
 * @param type
 */
function addLogoAssetInTemplate(
  template: TemplateClass,
  asset: AssetClass,
  type: LogoType,
) {
  const { logo } = template;
  if (logo[type]) {
    if (asset.id !== logo[type]?.id) {
      const index = template.getAssetIndexById(logo[type]?.id);
      template.replaceAssetClass(asset, index);
    }
  } else {
    template.addAssets([asset]);
  }
}

/**
 * @description 自动处理logo
 */
export function templateLogoReconcile() {
  const { templates, logoAsset } = assetHandler;

  templates.forEach((item) => {
    if (logoAsset.text) {
      addLogoAssetInTemplate(item, logoAsset.text, 'text');
    }
    if (logoAsset.image) {
      addLogoAssetInTemplate(item, logoAsset.image, 'image');
    }
  });
}

/**
 * @description 重新对bg]m进行分段梳理
 */
export function reconcileTemplateData() {
  templateLogoReconcile();
}

/**
 * @description 获取模板数据的深克隆
 * @param template
 */
export function cloneTemplate(template: TemplateClass) {
  return template.getTemplateCloned();
}

export function setLogoAsset(asset: Asset, type: 'text' | 'image') {
  assetHandler.setLogoAsset(asset, type);
  templateLogoReconcile();
  reportChange('setLogoAsset', true);
}

/**
 * @description 添加模板
 * @param templates
 * @param index 插入索引
 */
export function addTemplate(templates: RawTemplateData[], index = -1) {
  const active = assetHandler.addTemplate(templates, index);
  // assetHandler.setReplaceTemplateLoading(false);

  setTimeout(() => {
    reconcileTemplateData();
    reportChange('addTemplate', true);
  }, 10);
  return active;
}

export function initTemplate(templates: RawTemplateData[]) {
  const active = assetHandler.addTemplate(templates);

  return active;
}

/**
 * @description 替换模板
 * @param template
 * @param [id] 模板id,不传则替换当前选中模板
 */
export function replaceTemplate(
  template: RawTemplateData,
  id?: string | number,
) {
  // assetHandler.setReplaceTemplateLoading(true);
  const newData = formatRawTemplateData(template);
  let index = assetHandler.currentTemplateIndex;
  if (id) {
    const i = assetHandler.templates.findIndex((item) => item.id === id);
    if (i > -1) {
      index = i;
    }
  }
  assetHandler.replaceTemplate(index, newData);

  // assetHandler.setReplaceTemplateLoading(false);
  setTimeout(() => {
    reconcileTemplateData();
    reportChange('replaceTemplate', true);
  }, 10);
}

/**
 * @description 替换模板自身
 * @param template
 * @param [templateClass] 模板类
 */
export function replaceTemplateSelf(
  template: RawTemplateData,
  templateClass?: TemplateClass,
) {
  templateClass?.replaceSelf(template);

  // assetHandler.setReplaceTemplateLoading(false);
  setTimeout(() => {
    reconcileTemplateData();
    reportChange('replaceTemplateSelf', true);
  }, 10);
}

/**
 * 替换所有模板
 * */
export function replaceAllTemplate(templates: RawTemplateData[]) {
  const active = assetHandler.replaceAllTemplate(templates);
  setTimeout(() => {
    reconcileTemplateData();
    reportChange('replaceAllTemplate', true);
  }, 10);

  return active;
}

/**
 * @description 获取一个新的空模板数据
 * @param pageTime
 */
export function getEmptyTemplateData(pageTime = 10000) {
  return newTemplate(pageTime);
}

/**
 * @description 添加空模板模板
 */
export function addEmptyTemplate(pageTime = 10000, index?: number) {
  const newData: RawTemplateData[] = [newTemplate(pageTime)];
  const i = assetHandler.addTemplate(newData, index);

  setTimeout(() => {
    reconcileTemplateData();
    if (index) {
      templateLogoReconcile();
    }
    // reportChange('addEmptyTemplate', false);
  }, 10);

  return i;
}

interface NewAsset extends Attribute {
  type: AssetType;
  isBackground?: boolean;
}

/**
 * 添加模板并新增元素
 * */
export function addTemplateWithNewAsset({
  assets,
  pageTime,
  index,
  canvasSize,
}: {
  assets: NewAsset[];
  pageTime: number;
  index?: number;
  canvasSize?: { width: number; height: number };
}) {
  const template = new TemplateState(newTemplate(pageTime));

  const assetList: AssetClass[] = [];

  assets.forEach((item) => {
    const { type, isBackground, ...others } = item;
    let newAsset = newAssetTemplate(type);

    newAsset = new AssetItemState(newAsset as Asset);

    const transform = getNewAssetPosition(others, canvasSize);

    newAsset.update({
      meta: { isBackground, type },
      attribute: { ...others, startTime: 0, endTime: pageTime },
      transform: { ...transform, zindex: template.zIndex.max + 1 },
    });

    assetList.push(newAsset as AssetClass);
  });

  template.addAssets(assetList);

  const i = assetHandler.addTemplateClass([template], index);

  // setTimeout(() => {
  //   reconcileTemplateData();
  //   reportChange('addTemplateWithNewAsset', true);
  // }, 10);

  return i;
}

export function addTemplateClass(template: TemplateClass, index: number) {
  return assetHandler.addTemplateClass([template], index);
}

/**
 * @description 模板排序
 * @param currentIndex 选中模板的索引
 * @param targetIndex 放置位置的索引
 */
export function templateRearrange(currentIndex: number, targetIndex: number) {
  if (currentIndex === targetIndex) {
    return;
  }
  const currentTemplate = assetHandler.templates[currentIndex];

  runInAction(() => {
    [...assetHandler.templates].forEach((item, index) => {
      if (currentIndex < targetIndex) {
        if (index > currentIndex && index <= targetIndex) {
          assetHandler.templates[index - 1] = item;
        }
      } else {
        if (index >= targetIndex && index < currentIndex) {
          assetHandler.templates[index + 1] = item;
        }
      }
    });
    assetHandler.templates[targetIndex] = currentTemplate;
  });

  reportChange('templateRearrange', true);
}

/**
 * @description 订阅全部模板的基础数据（只会在模板替换位置、添加、删除等操作时，触发update）
 */
export function useGetAllTemplateByObserver() {
  const state = assetHandler.templates;

  return {
    templates: state,
    rearrange: templateRearrange,
  };
}

/**
 * @default 根据index设置当前模板
 * @param index
 */
export function setTemplateByIndex(index: number) {
  if (index > -1 && !config.wholeTemplate) {
    global.setVideoInfo({
      playStatus: config.PlayStatus.Stopped,
      currentTime: 0,
    });
    assetHandler.setCurrentTemplate(index);
  }
}

/**
 * @description 设置当前模板
 * @param id
 */
export function setTemplate(id: string | number) {
  const index = assetHandler.templates.findIndex((item) => item.id === id);
  setTemplateByIndex(index);
}

/**
 * @description 删除模板 删除后会返回上一个元素的id
 * @param id
 */
export function removeTemplate(id: string | number) {
  const index = assetHandler.templates.findIndex((item) => item.id === id);
  assetHandler.removeTemplate(index);

  setTimeout(() => {
    reconcileTemplateData();
    reportChange('removeTemplate', true);
  }, 10);

  if (index === 0) {
    return assetHandler.templates[0]?.id;
  }
  return assetHandler.templates[index - 1]?.id;
}
//
export function createTemplateClass() {
  return new TemplateState(newTemplate(10));
}

export function createTemplate() {
  return newTemplate(10);
}
