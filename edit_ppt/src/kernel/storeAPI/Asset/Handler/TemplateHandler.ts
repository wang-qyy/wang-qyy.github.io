import { reportChange, config } from '@kernel/utils/config';
import assetHandler from '@kernel/store/assetHandler';
import global from '@kernel/store/global';

import {
  getTemplateIndexById,
  getCanvasInfo,
  getAssetRtInfo,
} from '@kernel/store';
import {
  newTemplate,
  newImage,
  newSVG,
  newText,
  newVideoE,
  newLottie,
  newModule,
  newPlain,
  newCamera,
} from '@kernel/utils/assetTemplate';
import { runInAction, toJS } from 'mobx';
import { buildAttribute } from '@kernel/store/assetHandler/utils';
import {
  calcAfterTransferTime,
  calcBeforeTransferTime,
  frameToMS,
} from '@kernel/utils/StandardizedTools';

import {
  Asset,
  RawTemplateData,
  RGBA,
  TemplateData,
  VideoClip,
  Attribute,
  AssetType,
  TemplateBackground,
  TemplateClass,
  AssetClass,
  TransferLocation,
  LogoType,
  GradientType,
  Meta,
} from '@kernel/typing';

import { autoSetAudioDuration } from '@kernel/store/audioHandler/adapter';
import { formatRawTemplateData } from '@kernel/utils/assetHelper/formater/dataBuilder';
import {
  assetUpdater,
  setTemplateBackgroundColor,
  getCurrentTemplate,
} from '@/kernel/store';

import { getImage } from '@kernel/store/cacheManager/fatcher';
import {
  getAssetLimitTime,
  getNewAssetPosition,
} from '@kernel/storeAPI/Asset/utils';
import AssetItemState from '@kernel/store/assetHandler/asset';
import TemplateState from '@/kernel/store/assetHandler/template';

import {
  CAMERA_DEFAULT_DURATION,
  CAMERA_DISTANCE_DURATION,
  CAMERA_MIN_DURATION,
} from '@/config/basicVariable';

import CameraState from '@/kernel/store/assetHandler/template/camera';
import { setLllegelAssetsHandler } from './Updater';
import { addAssetInTemplate, replaceWholeAsset } from './AssetHandler';

export { setLllegelAssetsHandler };

export interface AddVideoEParams {
  meta?: {
    isBackground?: boolean;
  };
  attribute: {
    resId: Attribute['resId'];
    rt_url: Attribute['rt_url'];
    rt_preview_url: Attribute['rt_preview_url'];
    rt_frame_url: Attribute['rt_frame_url'];
    rt_total_frame: Attribute['rt_total_frame'];
    width: Attribute['width'];
    height: Attribute['height'];
    isUser: Attribute['isUser'];
    assetWidth: Attribute['assetWidth'];
    assetHeight: Attribute['assetHeight'];
    cst?: Attribute['cst'];
    cet?: Attribute['cet'];
    startTime?: Attribute['startTime'];
    endTime?: Attribute['endTime'];
    volume?: Attribute['volume'];
    voiced?: Attribute['voiced'];
  };
  transform?: {
    posX: number;
    posY: number;
  };
}
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
    transtion: Attribute['transtion'];
    totalTime: Attribute['totalTime'];
  };
  transform?: {
    posX: number;
    posY: number;
  };
}
export interface AddPlainParams {
  meta?: {
    type: 'plain';
  };
  attribute?: Attribute;
  transform?: {
    posX: number;
    posY: number;
  };
}
/**
 * @description 转场动画处理工具函数
 */
const TransferHandler = {
  getTransferIndex(assets: AssetClass[], transferLocation: TransferLocation) {
    return assets.findIndex(
      (item) => item.meta.transferLocation === transferLocation,
    );
  },
  /**
   * @description 隐藏不应该存在的转场
   * @param assets
   * @param transferLocation
   */
  clearTransfer(assets: AssetClass[], transferLocation: TransferLocation) {
    const index = TransferHandler.getTransferIndex(assets, transferLocation);
    if (index > -1) {
      runInAction(() => {
        assets.splice(index, 1);
      });
    }
  },
  /**
   * @description 已经存在after转场
   * @param templateIndex
   */
  hasAfterTransfer(templateIndex: number) {
    const targetTemplate = assetHandler.templates[templateIndex];
    return targetTemplate.assets.some(
      (asset) => asset.meta.transferLocation === 'after',
    );
  },
  /**
   * @description 构建转场数据
   * @param videoEInfo
   */
  buildTransferData(data: {
    assetInfo: AddLottieParams | AddVideoEParams;
    animation?: Animation;
    key: string;
    type: 'lottie' | 'videoE' | 'plain';
  }) {
    const { assetInfo, animation, key, type } = data;
    const { width, height } = getCanvasInfo();
    let asset: Asset;
    if (type === 'videoE') {
      // @ts-ignore
      asset = newVideoE() as Asset;
    } else if (type === 'lottie') {
      // @ts-ignore
      asset = newLottie() as Asset;
    } else {
      // @ts-ignore
      asset = newPlain() as Asset;
    }
    asset.meta.isUserAdd = true;
    asset.meta.isTransfer = true;
    asset.meta.transferLocation = 'after';
    // 清空转场的颜色
    asset.attribute.colors = {};
    // 转场播放不循环
    asset.attribute.isLoop = false;

    // asset.attribute.transtionKey = key;
    Object.assign(asset.attribute, { width, height });
    if (assetInfo) {
      Object.assign(asset.attribute, assetInfo?.attribute);
      Object.assign(asset.attribute, assetInfo?.transform);
      Object.assign(asset.meta, assetInfo?.meta);
    }

    if (width <= height) {
      // 非横版
      // 元素宽高比
      let wdScale = width / height;
      if (assetInfo.attribute.width && assetInfo.attribute.height) {
        wdScale = assetInfo.attribute.width / assetInfo.attribute.height;
      }
      const setWidth = height * wdScale;
      Object.assign(asset.attribute, {
        width: setWidth,
        height,
      });
      Object.assign(asset.transform, {
        posX: (width - asset.attribute.width) / 2,
      });
    }
    // 转场动画数据
    if (animation) {
      Object.assign(asset.attribute, { animation });
    }
    asset.transform.zindex =
      Number(assetHandler.currentTemplate?.maxZIndex) + 1;
    return new AssetItemState(asset);
  },
  /**
   * @description 复制某个片段的转场数据
   * @param videoEInfo
   */
  buildTransferDataByTemplate(transfer: Asset, template: TemplateClass) {
    transfer.transform.zindex = Number(template?.maxZIndex + 1);
    return new AssetItemState(transfer);
  },
};

/**
 * @description 统一化处理转场时长
 */
export function templateTransferReconcile() {
  runInAction(() => {
    const { templates } = assetHandler;
    const { length } = templates;

    for (let i = 0; i < length; i++) {
      const template = templates[i];
      const { assets, videoInfo } = template;
      const nextTemplate = templates[i + 1];
      if (i === 0) {
        TransferHandler.clearTransfer(assets, 'before');
      }
      if (!nextTemplate) {
        TransferHandler.clearTransfer(assets, 'after');
      }

      if (template.endTransfer) {
        let transferTime = frameToMS(
          template.endTransfer.attribute.rt_total_frame,
        );
        // 如果是lottie和转场动画，就直接取attribute.totalTime
        if (['plain', 'lottie'].includes(template.endTransfer.meta.type)) {
          transferTime = template.endTransfer.attribute.totalTime;
        }
        // 向下取整
        const halfTime = Math.floor(transferTime / 2);
        const setEndTime = videoInfo.pageTime - videoInfo.offsetTime[1];
        const setStartTime = setEndTime - halfTime;
        const afterTimeInfo = {
          startTime: setStartTime,
          endTime: setEndTime,
          cst: 0,
          cet: halfTime,
        };

        if (setStartTime < 0) {
          afterTimeInfo.startTime = 0;
          afterTimeInfo.cst = -setStartTime;
        }

        Object.assign(template.endTransfer.attribute, afterTimeInfo);
        // 动画时间处理 todo待优化
        if (template.endTransfer.attribute.animation) {
          Object.assign(template.endTransfer.attribute, {
            animation: {
              ...template.endTransfer.attribute.animation,
              exit: {
                ...template.endTransfer.attribute.animation?.exit,
                duration:
                  template.endTransfer.attribute.animation?.exit.duration === -1
                    ? -1
                    : afterTimeInfo.endTime - afterTimeInfo.startTime,
              },
              enter: {
                ...template.endTransfer.attribute.animation?.enter,
                duration:
                  template.endTransfer.attribute.animation?.enter.duration ===
                  -1
                    ? -1
                    : afterTimeInfo.endTime - afterTimeInfo.startTime,
              },
            },
          });
        }

        // 如果当前模板存在after转场，则给后一个模板添加响应的before模板
        if (nextTemplate) {
          const data = template.endTransfer.getAssetCloned();

          const { meta, attribute } = data;
          const { videoInfo: nextVideoInfo } = nextTemplate;
          meta.transferLocation = 'before';
          meta.isTransfer = true;
          attribute.cst = halfTime;
          attribute.cet = transferTime;

          attribute.startTime = nextVideoInfo.offsetTime[0] || 0;
          attribute.endTime = attribute.startTime + halfTime;

          // 动画时间处理
          if (attribute.animation) {
            attribute.animation = {
              exit: {
                ...attribute.animation?.exit,
                duration:
                  attribute.animation?.exit.duration === -1
                    ? -1
                    : transferTime / 2,
              },
              enter: {
                ...attribute.animation?.enter,
                duration:
                  attribute.animation?.enter.duration === -1
                    ? -1
                    : transferTime / 2,
              },
            };
          }
          // 如果已经存在before转场，则替换
          if (nextTemplate.startTransfer) {
            nextTemplate.startTransfer.replaceAssetSelf(data);
          } else {
            nextTemplate.addAsset(data);
          }
        }
      } else {
        // 如果当前模板不存在after转场，则删除后一个模板的before转场
        if (nextTemplate) {
          const index = TransferHandler.getTransferIndex(
            nextTemplate.assets,
            'before',
          );
          if (index > -1) {
            nextTemplate.assets.splice(index, 1);
          }
        }
      }
    }
    // reportChange("templateTransferReconcile", true);
  });
}

/**
 * @description 替换mg转场
 * @param templateIndex
 * @param data
 */
export function replaceMGTransfer(
  templateIndex: number,
  data: AddVideoEParams,
) {
  const assetClass = TransferHandler.buildTransferData({
    assetInfo: data,
    key: '',
    type: 'videoE',
  });
  const target = assetHandler.templates[templateIndex];
  if (target?.endTransfer) {
    const index = target.assets.findIndex(
      (item) => item.meta.id === target.endTransfer?.meta.id,
    );
    if (index > -1) {
      target.replaceAssetClass(assetClass, index);
      setTimeout(() => {
        templateTransferReconcile();
        reportChange('replaceMGTransfer', true);
      }, 10);
    }
  }
}
/**
 * @description 批量应用mg转场
 * @param templateIndex
 */
export function batchSetMGTransfer(templateIndex: number) {
  const { templates } = assetHandler;
  const currentTransfer = templates[templateIndex]?.endTransfer;
  if (currentTransfer) {
    templates.forEach((template) => {
      const replaceAsset = TransferHandler.buildTransferDataByTemplate(
        currentTransfer.getAssetCloned(),
        template,
      );
      if (template?.endTransfer) {
        const index = template.assets.findIndex(
          (item) => item.meta.id === template.endTransfer?.meta.id,
        );
        template.replaceAssetClass(replaceAsset, index);
      } else {
        template.addAssets([replaceAsset]);
      }
    });
    setTimeout(() => {
      templateTransferReconcile();
      reportChange('batchSetMGTransfer', true);
    }, 10);
  }
}
/**
 * @description 添加MG转场
 * @param templateIndex
 * @param data
 */
export function addMGTransfer(templateIndex: number, data: AddVideoEParams) {
  if (TransferHandler.hasAfterTransfer(templateIndex)) {
    replaceMGTransfer(templateIndex, data);
  } else {
    const assetClass = TransferHandler.buildTransferData({
      assetInfo: data,
      key: '',
      type: 'videoE',
    });
    const targetTemplate = assetHandler.templates[templateIndex];
    if (targetTemplate && assetHandler.templates[templateIndex + 1]) {
      const target = assetHandler.templates[templateIndex];
      target.addAssets([assetClass]);
      setTimeout(() => {
        templateTransferReconcile();
        reportChange('addMGTransfer', true);
      }, 10);
    }
  }
}

/**
 * @description 删除mg动画
 * @param templateIndex
 * @param id
 */
export function removeMGTransfer(templateIndex: number, id: number) {
  const target = assetHandler.templates[templateIndex];
  target.removeAsset(id);
  setTimeout(() => {
    templateTransferReconcile();
    reportChange('removeMGTransfer', true);
  }, 10);
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
  autoSetAudioDuration();
  templateTransferReconcile();
  templateLogoReconcile();
}

/**
 * @description 通过模板时间标尺
 */
export function getTemplateTimeScale() {
  return assetHandler.timeScale;
}
/**
 * @description 通过模板时间标尺
 */
export function getValidAssets() {
  return assetHandler?.currentTemplate.validAssets || [];
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

  setTimeout(() => {
    const { assets } = assetHandler;
    assets.forEach((asset) => {
      if (asset.meta.isLogo) {
        assetHandler.setLogoAsset(asset, asset.meta.type);
      }
    });
  }, 10);
  // 初始化模板，需要设置音频时间
  autoSetAudioDuration();
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
    reportChange('addEmptyTemplate', false);
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
    let newAsset;

    switch (type) {
      case 'video':
      case 'videoE':
        newAsset = newVideoE();
        break;
      case 'pic':
      case 'image':
        newAsset = newImage();
        break;
      case 'SVG':
        newAsset = newSVG();
        break;

      case 'lottie':
        newAsset = newLottie();
        break;

      case 'module':
        newAsset = newModule();
        break;
      case 'text':
        newAsset = newText();
        break;
    }

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
  templateTransferReconcile();
  // assetHandler.addTemplate([currentTemplate], targetIndex);
  // if (currentIndex > targetIndex) {
  //   assetHandler.removeTemplate(currentIndex + 1);
  // } else {
  //   assetHandler.removeTemplate(currentIndex);
  // }
  reportChange('templateRearrange', true);
  // console.log({
  //   currentIndex,
  //   targetIndex,
  //   template: toJS(assetHandler.templates),
  // });
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

/**
 * @description 设置模板的时长
 * @param template
 * @param endTime
 * @param offsetTime
 */
export const resetTemplateEndTime = (
  template: TemplateClass,
  endTime: number,
  offsetTime?: VideoClip,
) => {
  const cutTime = offsetTime || template.videoInfo.offsetTime || [0, 0];
  template.updatePageInfo({
    pageTime: endTime,
    offsetTime: cutTime,
  });

  reconcileTemplateData();
  reportChange('resetTemplateEndTime', true);
};

/**
 * @description 设置当前模板的时长
 * @param endTime
 */
export function setCurrentTemplateEndTime(endTime: number) {
  if (assetHandler.currentTemplate) {
    assetHandler.currentTemplate.updatePageInfo({ pageTime: endTime });
    // resetTemplateEndTime(assetHandler.currentTemplate, endTime);

    setTimeout(() => {
      reconcileTemplateData();
      reportChange('setCurrentTemplateEndTime', true);
    }, 10);
  }
}

/**
 * @description 设置模板的时长
 * @param endTime
 * @param index
 */
export function setTemplateEndTime(endTime: number, index?: number) {
  let template = assetHandler.currentTemplate;

  if (typeof index === 'number') {
    template = assetHandler.templates[index];
  }

  if (template) {
    template.updatePageInfo({ pageTime: endTime });

    // resetTemplateEndTime(template, endTime);

    setTimeout(() => {
      reconcileTemplateData();
      reportChange('setTemplateEndTime', true);
    }, 10);
  }
}

/**
 * @description 设置模板的封面
 * @param poster
 * @param [id] 如果为空，则会以当前选中模板为目标
 */
export function setTemplatePoster(poster: string, id?: string) {
  const index = id
    ? getTemplateIndexById(id)
    : assetHandler.currentTemplateIndex;
  if (index > -1) {
    const template = assetHandler.templates[index];
    template.updateTemplate({
      poster,
    });
    reportChange('setTemplatePoster', true);
  }
}

export function updateTemplateBackgroundColor(color: RGBA | GradientType) {
  // 设置背景颜色
  setTemplateBackgroundColor(getCurrentTemplate(), color);
  reportChange('SetTemplateBackgroundColor', true);
}

/**
 * @description 设置模板背景颜色
 */
export function useSetTemplateBackgroundColorByObserver() {
  const backgroundColor =
    assetHandler.currentTemplate?.pageAttr.backgroundColor;

  return { backgroundColor, update: updateTemplateBackgroundColor };
}

/**
 * @description 模板裁剪
 */
export function useTemplateClip(
  templateIndex: number,
): [VideoClip, (clip: VideoClip) => void] {
  // const { currentTemplate } = assetHandler;
  const currentTemplate = assetHandler.templates[templateIndex];
  const value = currentTemplate?.videoInfo?.offsetTime || [0, 0];

  function update(clip: VideoClip) {
    if (!clip) {
      return;
    }
    const { videoInfo, assets } = currentTemplate;
    const { pageTime } = videoInfo;
    // eslint-disable-next-line prefer-const
    let [before, after] = clip;
    runInAction(() => {
      const newClip: VideoClip = [...clip];
      const limit = getAssetLimitTime(assets, pageTime);
      let newPageTime = pageTime;

      if (limit.startTime >= before) {
        newClip[0] = 0;
      } else {
        newClip[0] = before - limit.startTime;
      }

      if (after < 0) {
        newClip[1] = 0;
        newPageTime -= after;
      }
      assets.forEach((asset) => {
        const { meta, attribute, assetDuration } = asset;
        // 停留特效  停留时间最大等于元素停留时长
        if (attribute?.stayEffect) {
          assetUpdater(
            asset,
            buildAttribute({
              stayEffect: {
                ...attribute?.stayEffect,
                duration: Math.min(
                  assetDuration.endTime - assetDuration.startTime,
                  attribute?.stayEffect.duration,
                ),
              },
            }),
          );
        }

        if (asset.meta.isBackground) {
          const assetTime = { ...assetDuration };
          if (['video', 'videoE'].includes(meta.type)) {
            if (!attribute.isLoop) {
              attribute.isLoop = true;
            }
          }
          assetTime.endTime = newPageTime;
          assetUpdater(
            asset,
            buildAttribute({
              ...assetTime,
            }),
          );
        }

        if (asset.meta.isLogo) {
          const assetTime = { ...assetDuration };
          assetTime.endTime = newPageTime;
          assetUpdater(
            asset,
            buildAttribute({
              ...assetTime,
            }),
          );
        }

        if (meta.isTransfer) {
          let assetTime = { ...assetDuration };
          if (meta.transferLocation === 'before') {
            assetTime = calcBeforeTransferTime(assetTime, newPageTime, newClip);
          }
          if (meta.transferLocation === 'after') {
            assetTime = calcAfterTransferTime(assetTime, newPageTime, newClip);
          }
          assetUpdater(
            asset,
            buildAttribute({
              ...assetTime,
            }),
          );
        }
      });
      // console.log(newClip);
      resetTemplateEndTime(currentTemplate, newPageTime, newClip);
    });
    reportChange('useTemplateClip', true);
  }

  return [value, update];
}

/**
 * @description 设置模板背景图片
 */
export function useSetTemplateBackgroundImage() {
  const { currentTemplate } = assetHandler;

  async function update(info: TemplateBackground['backgroundImage']) {
    await getImage(info.rt_imageUrl);

    currentTemplate.updateBackgroundImage(info);
    reportChange('setModuleBackgtound', true);
  }

  return {
    value: currentTemplate?.pageAttr.backgroundImage,
    update,
  };
}

export function setBgAnimation(id: number) {
  const bg = assetHandler.currentTemplate.backgroundAsset;
  if (id > 0) {
    assetUpdater(
      bg,
      buildAttribute({
        bgAnimation: {
          id,
        },
      }),
    );
  } else {
    assetUpdater(
      bg,
      buildAttribute({
        bgAnimation: undefined,
      }),
    );
  }

  reportChange('setBgAnimation', true);
}

/**
 * 设置模板倍速
 */
export function setTemplateSpeed(speed: number, template?: TemplateClass) {
  const targetTemplate = template ?? assetHandler.currentTemplate;
  targetTemplate.updatePageInfo({ speed });
  setTimeout(() => {
    reconcileTemplateData();
    reportChange('setTemplateSpeed', true);
  }, 10);
}
// 添加模板
export function addNewTemplateWithAssets() {}

/** *******************************新转场分割线*********************************** */
/**
 * @description 添加新版转场
 * @param templateIndex
 * @param data
 */
export async function newAddMGTransfer(
  templateIndex: number,
  data: {
    assetInfo: AddLottieParams | AddPlainParams;
    animation: Animation;
    key: string;
  },
) {
  if (TransferHandler.hasAfterTransfer(templateIndex)) {
    replaceMGTransfer(templateIndex, data);
  } else {
    const assetClass = TransferHandler.buildTransferData({
      ...data,
      key: '',
      type: data.assetInfo.meta?.type,
    });
    await getAssetRtInfo(assetClass);
    const targetTemplate = assetHandler.templates[templateIndex];
    if (targetTemplate && assetHandler.templates[templateIndex + 1]) {
      const target = assetHandler.templates[templateIndex];
      target.addAssets([assetClass]);
      setTimeout(() => {
        templateTransferReconcile();
        reportChange('addMGTransfer', true);
      }, 10);
    }
  }
}

/**
 * @description 替换mg转场
 * @param templateIndex
 * @param data
 */
export async function newReplaceMGTransfer(
  templateIndex: number,
  data: {
    assetInfo: AddLottieParams | AddPlainParams;
    animation: Animation;
    key: string;
  },
) {
  const assetClass = TransferHandler.buildTransferData({
    ...data,
    key: '',
    type: data.assetInfo.meta?.type,
  });
  await getAssetRtInfo(assetClass);
  const target = assetHandler.templates[templateIndex];
  if (target?.endTransfer) {
    const index = target.assets.findIndex(
      (item) => item.meta.id === target.endTransfer?.meta.id,
    );
    if (index > -1) {
      target.replaceAssetClass(assetClass, index);
      setTimeout(() => {
        templateTransferReconcile();
        reportChange('replaceMGTransfer', true);
      }, 10);
    }
  }
}
/** *******************************新转场分割线*********************************** */

export function createTemplateClass(template: TemplateData) {
  return new TemplateState(template);
}
/** *******************************视频特效分割线*********************************** */
const EffectVideoHandler = {
  /**
   * @description 已经存在视频特效
   * @param templateIndex
   */
  getEffectVideo(templateIndex: number) {
    const targetTemplate = assetHandler.templates[templateIndex];
    return targetTemplate.assets.find((item) => item.meta.isOverlay);
  },
  /**
   * 添加/替换视频特效
   * @param templateIndex
   */
  addReplaceEffectVideoByTemplateIndex(templateIndex: number, asset: Asset) {
    const targetTemplate = assetHandler.templates[templateIndex];
    // 原始的视频特效
    const originAsset = targetTemplate.assets.find(
      (item) => item.meta.isOverlay,
    );
    if (originAsset) {
      replaceWholeAsset({
        data: asset,
        asset: originAsset,
        save: true,
      });
    } else {
      addAssetInTemplate(asset, targetTemplate);
    }
  },
};
// 视频特效相关
export function useEffectVideoEByObserver() {
  const { currentTemplateIndex } = assetHandler;
  const value = EffectVideoHandler.getEffectVideo(currentTemplateIndex);

  const update = (asset: any) => {
    EffectVideoHandler.addReplaceEffectVideoByTemplateIndex(
      currentTemplateIndex,
      asset,
    );
  };
  return { value, update };
}
/** *******************************视频特效分割线*********************************** */
/** *******************************镜头分割线*********************************** */
// 打开/关闭镜头画布交互
export function openCloseCamera(visible: boolean) {
  assetHandler.setStatus({ inCamera: visible });
}
export function useCameraByObeserver(template?: TemplateState) {
  const { status, templates } = assetHandler;
  const { width } = getCanvasInfo();
  const currentTemplate = template
    ? templates.filter((item) => {
        return item.id === template.id;
      })[0]
    : assetHandler.currentTemplate;
  // 获取添加的镜头数据
  const getBuildCamera = (index: number, location: 'before' | 'after') => {
    const { pageAttr } = currentTemplate;
    const { offsetTime = [0, 0], pageTime } = pageAttr.pageInfo;
    const templateEnd = pageTime - offsetTime[1];

    const camerasList = currentTemplate.cameras;
    const canvasInfo = getCanvasInfo();
    const initCamera = newCamera(canvasInfo);
    if (index !== -1 && camerasList[index]) {
      initCamera.width *= 0.5;
      initCamera.height *= 0.5;
      initCamera.scale /= 0.5;
      if (location === 'before') {
        initCamera.endTime = camerasList[index].camera.startTime;
        initCamera.startTime = initCamera.endTime - CAMERA_DISTANCE_DURATION;
      } else {
        const { endTime } = camerasList[index].camera;
        const limit = {
          endTime: templateEnd,
        };
        if (index !== camerasList.length - 1) {
          limit.endTime = camerasList[index + 1].camera.startTime;
        }
        // 上一个镜头的结束时间+2个镜头最短间距
        initCamera.startTime = endTime + CAMERA_DISTANCE_DURATION;
        // 镜头的开始时间+镜头的默认时长
        initCamera.endTime = initCamera.startTime + CAMERA_DEFAULT_DURATION;
        // 判断是否超过最大结束时间限制
        if (initCamera.endTime > limit.endTime) {
          if (
            limit.endTime - CAMERA_DISTANCE_DURATION >
            endTime + CAMERA_MIN_DURATION
          ) {
            initCamera.startTime = endTime + CAMERA_DISTANCE_DURATION;
          } else {
            initCamera.startTime = endTime;
          }
          initCamera.endTime = limit.endTime;
        }
      }
      Object.assign(initCamera, getNewAssetPosition(initCamera));
      if (initCamera.startTime === initCamera.endTime) {
        return undefined;
      }
    }

    return initCamera;
  };
  // 添加镜头
  const addCamera = (index: number, location: 'before' | 'after') => {
    const camers = getBuildCamera(index, location);
    if (camers) {
      camers.scale = width / camers.width;
      let active;
      if (location === 'before') {
        camers.startTime = Math.max(0, camers.startTime);
        active = currentTemplate.addCameraPre(camers);
      } else {
        active = currentTemplate.addCamera(camers, index);
      }
      assetHandler.seteditCamera(active);
      reportChange('addCamera', true);
    }
  };
  const start = () => {
    if (currentTemplate.cameras.length === 0) {
      addCamera(-1, 'after');
    }
    assetHandler.setStatus({ inCamera: !status.inCamera });
    // 清空正在编辑的镜头
    assetHandler.seteditCamera(undefined);
  };
  // 移除镜头
  const removeCamera = (index: number, currentCamera?: CameraState) => {
    const camerasList = currentTemplate.cameras;
    if (index !== -1) {
      currentTemplate.removeCamera(index);
    }
    if (currentCamera) {
      const tmpIndex = camerasList.findIndex(
        (item) => item.id === currentCamera.id,
      );
      currentTemplate.removeCamera(tmpIndex);
    }

    // 清空正在编辑的镜头
    assetHandler.seteditCamera(undefined);
    reportChange('removeCamera', true);
  };
  const clearStatus = () => {
    assetHandler.setStatus({ inCamera: false });
    // 清空正在编辑的镜头
    assetHandler.seteditCamera(undefined);
  };
  const removeAll = () => {
    currentTemplate.removeAllCamera();
    reportChange('removeCamera', true);
  };
  return {
    addCamera,
    removeCamera,
    start,
    clearStatus,
    removeAll,
    inCamera: status.inCamera,
  };
}
export function getCarmeraStatus() {
  return assetHandler.status.inCamera;
}
/** *******************************镜头分割线*********************************** */
