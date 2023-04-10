import { CSSProperties } from 'react';
import { runInAction } from 'mobx';

import {
  Asset,
  AssetClass,
  assetBlur,
  toggleAssetEditStatus,
  getCurrentTemplate,
  activeEditableAssetInTemplate,
  updateAssetZIndex,
  replaceWholeAsset,
  addModule,
  Attribute,
  Meta,
  AssetType,
  Transform,
  RGBA,
  addAssetInTemplate,
  getCurrentTimeRange,
  setCurrentTime,
  getAssetCoords,
  isAssetInMask,
  getCurrentAsset,
  getCanvasInfo,
  setMaskAssetChildren,
  isMaskType,
  getAllAsset,
  toJS,
  getTemplateIndexById,
  getTemplateTimeScale,
  TemplateClass,
  ShapeType,
  SvgInfo,
  isTempModuleType,
  getCurrentAssetCopy,
  EffectInfo,
  overlayType,
  QrcodeInfo,
} from '@hc/editor-core';
import { getTemplateInfo } from '@/api/template';
import getUrlParams from '@/utils/urlProps';
import {
  getEditableAssetOnCurrentTime,
  setAssetTempData,
} from '@/kernel/store';
import { MaskChildAssetType } from '@/kernel/utils/const';

import {
  assetToMask,
  formatChildSizeByMask,
} from '@/kernel/utils/assetHelper/formater/dataBuilder';

import { getResAssets } from '@/pages/Content/ConciseMode/store/adapter';
import { reportChange } from '@/kernel/utils/config';
import conciseModeStore from '@/pages/Content/ConciseMode/store';
import { getActiveAudio } from '@/store/adapter/useAudioStatus';

import { useOneKeyReplace } from '@/store/adapter/useGlobalStatus';
import oneKeyReplaceStore from '@/pages/Content/OnekeyRepalce/store';
import { getOneReplaceList } from '@/pages/Content/OnekeyRepalce/store/adapter';
import { message } from 'antd';
import {
  formatReplaceSize,
  getBackgroundAssetSize,
} from './assetHandler/assetUtils';
import {
  getNewAssetTemplate,
  getNewAssetDuration,
  getNewAssetPosition,
  getNewAssetSize,
} from './assetHandler/init';
import { doAssetGuide } from './guide';
import fontColorChecker from './assetHandler/FontColorChecker';
import { clickActionWeblog } from './webLog';

const { redirect } = getUrlParams();

/**
 * @description 选中元素并进入可视区
 * 包含模板裁剪参数
 * */
export function setAssetIntoView(opts: {
  asset: AssetClass;
  template?: TemplateClass;
  withAbsoluteTime?: boolean;
}) {
  const { asset, template, withAbsoluteTime = true } = opts;
  const {
    meta: { id },
  } = asset;

  const targetTemplate = template ?? getCurrentTemplate();

  const templateIndex = getTemplateIndexById(targetTemplate.id);

  const absoluteTime = withAbsoluteTime
    ? getTemplateTimeScale()[templateIndex][0]
    : 0;

  const { startTime } = asset.assetDuration;

  activeEditableAssetInTemplate(id, asset.parent);
  const { offsetTime: [cs, ce] = [0, 0], speed = 1 } = targetTemplate.videoInfo;
  const time = Math.max(startTime - cs, 0) * (1 / speed);
  setCurrentTime(time + absoluteTime, false);
}

// 锁定/解锁元素
export function setAssetEditStatus(asset?: AssetClass) {
  if (asset) {
    const { locked, id } = asset.meta;

    toggleAssetEditStatus(asset);
    if (redirect === 'designer') {
      if (!locked) {
        assetBlur();
      } else {
        activeEditableAssetInTemplate(id);
      }
    }
  }
}

interface AssetBasicAttribute {
  resId: Attribute['resId'];
  width: Attribute['width'];
  height: Attribute['height'];
  startTime?: Attribute['startTime'];
  endTime?: Attribute['endTime'];
}

interface AddTextParams {
  text: Attribute['text'];
  fontSize?: number;
  ranking?: '0';
  color?: RGBA;
  fontWeight?: CSSProperties['fontWeight'];
  fontFamily?: CSSProperties['fontFamily'];
  lineHeight?: CSSProperties['lineHeight'];
  letterSpacing?: CSSProperties['letterSpacing'];
  effect?: Attribute['effect'];
  effectColorful?: Attribute['effectColorful'];
}

interface AddImageParams {
  picUrl: Attribute['picUrl'];
}

interface AddVideoParams {
  isUser: Attribute['isUser'];
  rt_url: Attribute['rt_url'];
  rt_total_time: Attribute['rt_total_time'];
  rt_total_frame: Attribute['rt_total_frame'];
  rt_frame_url?: Attribute['rt_frame_url'];
  isLoop?: Attribute['isLoop'];
  cst?: Attribute['cst'];
  cet?: Attribute['cet'];
  volume?: Attribute['volume'];
  voiced?: Attribute['voiced'];
}

interface AddSVGParams {
  source_key: Attribute['source_key'];
  SVGUrl: Attribute['SVGUrl'];
}

interface AddSVGPathParams {
  svgInfo: SvgInfo;
}
/**
 * 元素添加之后做的一下操作
 * 比如用户编辑器添加之后默认选中
 * */
export function afterAddAsset(asset: AssetClass | undefined) {
  if (asset) {
    const { meta } = asset;
    const { type, id, isBackground } = meta;

    if (redirect === 'designer') {
      // todo
    } else {
      if (!isBackground) {
        activeEditableAssetInTemplate(id);
      }
    }

    // 添加背景元素默认置底
    if (isBackground) {
      updateAssetZIndex({
        direction: 'bottom',
        asset,
      });
    }
    // 执行触发式新手引导
    doAssetGuide(asset);
  }
}

interface AddAssetParams {
  assets: Asset[];
  attribute: Partial<
    AssetBasicAttribute &
      (
        | AddImageParams
        | AddSVGParams
        | AddVideoParams
        | AddTextParams
        | AddSVGPathParams
        | { effectInfo: EffectInfo }
        | { qrcodeInfo: QrcodeInfo }
      )
  >;
  meta: {
    type: AssetType;
    shapeType?: ShapeType;
    isBackground?: Meta['isBackground'];
    addOrigin?: Meta['addOrigin'];
    isUserAdd?: Meta['isUserAdd'];
    replaced?: boolean;
    originResId?: string | number;
    locked?: boolean;
    overlayType?: overlayType;
    isOverlay?: boolean;
    name?: string;
  };
  transform?: Partial<Transform>;
}

function isInteger(num: Number) {
  return Number.isInteger(num);
}

/**
 * @description 是否需要自动设置元素时长
 * */
function isAutoDuration(attribute: any) {
  const { startTime, endTime } = attribute;
  return !(isInteger(startTime) && isInteger(endTime));
}
/**
 * @description 把元素添加进蒙版的数据处理
 * @param currentAsset
 * @param asset
 */
function addAssetInMask(currentAsset: AssetClass, asset: Asset) {
  const { attribute, meta, transform } = asset;
  const size = formatChildSizeByMask(currentAsset, {
    width: attribute.width,
    height: attribute.height,
  });
  asset.attribute = {
    ...attribute,
    width: size.width,
    height: size.height,
  };
  // 修正蒙版子图层的位置
  const position = {
    posX: (currentAsset.attribute.width - size.width) / 2,
    posY: (currentAsset.attribute.height - size.height) / 2,
  };
  asset.transform = {
    ...transform,
    ...position,
  };
  setMaskAssetChildren(currentAsset, asset);
}
/**
 * @description 判断是否往蒙版里面添加图层
 * @param asset
 * @param position
 * @returns 返回false,正常添加图片
 */
function checkIsInnerMask(
  asset: Asset,
  mousePosition: { left: number; top: number },
  scale: number,
) {
  let assetList = getEditableAssetOnCurrentTime();
  assetList = assetList.filter(item => item.meta.type === 'mask');
  const { meta } = asset;
  if (MaskChildAssetType.includes(meta?.type)) {
    let maskAsset: AssetClass;
    // const position = {
    //   left: mousePosition?.left,
    //   top: mousePosition?.top,
    // };
    // assetList.forEach((assetItem) => {
    // const mask = getAssetCoords(assetItem);
    // const sign = isAssetInMask(mask, position);
    // if (assetItem?.tempData?.rt_hover?.isMaskCenter) {
    //   maskAsset = assetItem;
    // }
    // })
    const maskList = assetList.filter(assetItem => {
      if (
        assetItem?.tempData.rt_hover &&
        !assetItem?.tempData.rt_hover?.isMaskCenter
      ) {
        setAssetTempData(assetItem, { rt_hover: undefined });
      }
      return assetItem?.tempData.rt_hover?.isMaskCenter;
    });
    if (maskList.length > 0) {
      maskAsset = maskList[0];
    }
    if (maskAsset) {
      if (maskAsset?.tempData.rt_hover?.isMaskCenter) {
        addAssetInMask(maskAsset, asset);
        return true;
      }
      setAssetTempData(maskAsset, { rt_hover: undefined });
    }
  }
  return false;
}

// 添加文字前判断背景颜色是深色还是浅色
export const getAddFontColor = async (
  asset: Partial<AddAssetParams>,
): Promise<RGBA> => {
  if (!asset.attribute) return { r: 0, g: 0, b: 0, a: 1 };
  const { height = 0, width = 0 } = asset.attribute;
  const { posY = 0, posX = 0 } = asset.transform || {};
  const fontSize = (asset.attribute as AddTextParams).fontSize || 90;

  const isLight = await fontColorChecker.checkLightColor({
    fontWidth: fontSize * 6,
    fontHeight: height,
    // posX: width / 2 - fontSize * 3,
    posX: posX + width / 2 - fontSize * 3,
    posY,
  });
  const v = isLight ? 0 : 255;
  return { r: v, g: v, b: v, a: 1 };
};

/**
 * @description 添加元素
 * */
export async function handleAddAsset(
  params: Partial<AddAssetParams>,
  mousePosition?: { left: number; top: number },
  // 是否是粘贴
  isPaste = false,
) {
  const { scale } = getCanvasInfo();
  const { attribute, meta, transform, assets } = params;

  const { type } = meta;

  const asset = getNewAssetTemplate(type) as Asset;

  if (assets) {
    asset.assets = assets;
  }

  Object.assign(asset.attribute, attribute);
  Object.assign(asset.meta, {
    ...meta,
    isUserAdd: !redirect,
    trackId: asset.meta.trackId,
  });
  Object.assign(asset.transform, transform);
  if (isAutoDuration(attribute)) {
    const duration = getNewAssetDuration();
    Object.assign(asset.attribute, duration);
  }

  // Object.assign(meta, { isUserAdd: true });

  // 拖拽添加的元素不需要重新计算尺寸
  if (!mousePosition && !['text', 'svgPath'].includes(type)) {
    const size = getNewAssetSize(attribute, meta);
    Object.assign(asset.attribute, size);
  }
  if (!transform) {
    // 元素默认位置  注意要在确定元素宽高之后获取位置
    const position = getNewAssetPosition(asset.attribute);
    Object.assign(asset.transform, position);
  }
  if (asset.meta?.isOverlay) {
    // 视频特效元素  默认铺满 从片段开头 位置居中
    const position = getNewAssetPosition(asset.attribute);
    Object.assign(asset.transform, position);
    asset.attribute.startTime = 0;
  }
  // 判断图片视频元素是否需要添加进蒙版
  if (mousePosition && checkIsInnerMask(asset, mousePosition, scale)) {
    return;
  }

  if (!isPaste && type === 'text' && !asset.attribute.textBackground) {
    asset.attribute.color = await getAddFontColor(asset);
  }

  const result = await addAssetInTemplate(asset);

  afterAddAsset(result);

  return result;
}

// 替换元素所需要继承的属性
const replaceInheritAttribute = (oldAsset: Asset) => {
  const { attribute } = oldAsset;

  const {
    resId,
    ufsId,
    SVGUrl,
    rt_url,
    cst,
    cet,
    source_key,
    rt_svgString,
    isUser,
    ...others
  } = attribute;

  return { ...others, colors: {} };
};

/**
 * @description 替换元素
 * */
export async function handleReplaceAsset(opts: {
  params: AddAssetParams;
  asset?: AssetClass;
  save?: boolean;
}) {
  const { params, asset, save = true } = opts;
  let currentAsset = getCurrentAsset();
  const canvasInfo = getCanvasInfo();
  let newAsset = asset ?? currentAsset;

  // 替换时，如果图片或视频没有裁剪，先自动裁剪一下  过滤掉背景以及组内元素
  if (
    newAsset &&
    MaskChildAssetType.includes(newAsset?.meta.type) &&
    !newAsset?.meta.isBackground &&
    !newAsset?.parent
  ) {
    newAsset = assetToMask(newAsset);
    currentAsset = newAsset;
  }

  // TODO 测试性代码，不确定是否可行，待讨论
  params.meta.replaced = true;
  params.attribute.originResId =
    newAsset?.attribute.originResId || newAsset?.attribute.resId;

  if (newAsset) {
    if (newAsset.meta.type === 'mask') {
      if (newAsset.assets?.length) {
        [newAsset] = newAsset.assets;
      } else {
        const assetParams = getNewAssetTemplate(params.meta.type) as Asset;
        Object.assign(assetParams.attribute, {
          ...params.attribute,
          assetWidth: params.attribute.width,
          assetHeight: params.attribute.height,
        });
        const size = getNewAssetSize(assetParams.attribute, assetParams.meta);
        Object.assign(assetParams.attribute, size);
        Object.assign(assetParams.meta, params.meta);
        Object.assign(assetParams.transform, params.attribute);

        // 往蒙版里面添加元素
        addAssetInMask(newAsset, assetParams);
        return;
      }
    }

    const { meta, attribute, transform } = newAsset;

    let { container } = attribute;

    // 需要继承的属性
    const inheritAttribute = replaceInheritAttribute(newAsset);
    let newSize = {};
    let newPosition = {};
    if (currentAsset) {
      // 如果存在裁剪，以裁剪尺寸为主
      newSize = formatReplaceSize(
        attribute?.container ?? attribute,
        params.attribute,
        canvasInfo,
        currentAsset,
      );
      // 修正蒙版子图层的方案
      if (isMaskType(currentAsset)) {
        newPosition.posX = (currentAsset.attribute.width - newSize.width) / 2;
        newPosition.posY = (currentAsset.attribute.height - newSize.height) / 2;
      }
    }
    // 如果newAsset为蒙版的子元素  需要调整尺寸以及位置信息----针对批量替换的处理
    if (newAsset.parent && isMaskType(newAsset.parent)) {
      newSize = formatReplaceSize(
        attribute,
        params.attribute,
        canvasInfo,
        newAsset.parent,
      );
      newPosition.posX = (newAsset.parent.attribute.width - newSize.width) / 2;
      newPosition.posY =
        (newAsset.parent.attribute.height - newSize.height) / 2;
    }

    // 如果存在裁剪，清空裁剪的位置信息，保证铺满整个裁剪框
    if (container) {
      container = { ...container, posX: 0, posY: 0 };
    }
    if (meta.isBackground) {
      newSize = getBackgroundAssetSize(params.attribute);
      newPosition = getNewAssetPosition(newSize);

      if (['video', 'videoE'].includes(params.meta.type)) {
        inheritAttribute.bgAnimation = undefined;
      }
    }
    const temp = {
      meta: { ...meta, ...params.meta, isUserAdd: true },
      attribute: {
        ...inheritAttribute,
        ...params.attribute,
        ...newSize,
        mattingInfo: undefined,
        container,
        cropXFrom: 0,
        cropXTo: 1,
        cropYFrom: 0,
        cropYTo: 1,
      },
      transform: {
        ...transform,
        ...params.transform,
        ...newPosition,
      },
    };
    const result = await replaceWholeAsset({
      data: temp,
      asset: newAsset,
      save,
    });

    return result;
  }
}

export const handleBatchReplaceAsset = async (newList: any[]) => {
  const { setLoading } = conciseModeStore;
  const resAssets = getResAssets();
  const unreplacedList = resAssets.filter(t => !t.replaced);

  setLoading(true);
  runInAction(async () => {
    const actions: Promise<void>[] = [];
    newList.forEach((item, index) => {
      const assets = unreplacedList[index]?.assets;
      if (!assets) return;
      assets.forEach(asset => {
        actions.push(handleReplaceAsset({ params: item, asset, save: false }));
      });
    });

    await Promise.all(actions);
    setLoading(false);
    reportChange('replaceWholeAsset', true);
  });
};
export const handleOnkeyBatchReplaceAsset = async (newList: any[]) => {
  const { setLoading } = oneKeyReplaceStore;
  const resAssets = getOneReplaceList();
  const unreplacedList = resAssets.filter(t => !t.replaced);

  setLoading(true);
  runInAction(async () => {
    const actions: Promise<void>[] = [];
    newList.forEach((item, index) => {
      const assets = unreplacedList[index]?.assets;
      if (!assets) return;
      assets.forEach(asset => {
        actions.push(handleReplaceAsset({ params: item, asset, save: false }));
      });
    });

    await Promise.all(actions);
    setLoading(false);
    message.info('一键替换成功');
    reportChange('replaceWholeAsset', true);
  });
};
// todo 添加组 待取默认的位置信息 @王启跃
export async function handleAddModule(
  moduleId: string,
  position?: { posX: number; posY: number },
) {
  const { doc } = await getTemplateInfo({
    picId: moduleId,
    template_type: 41,
  });
  // const doc = module;

  if (doc) {
    const { allAnimationTime, offsetTime: [cs, ce] = [0, 0] } =
      getCurrentTemplate().videoInfo;

    const duration = getNewAssetDuration();

    const result = await addModule({
      resId: doc.pageAttr.pageInfo[0].tid,
      assets: doc.work[0],
      moduleDuration: doc.pageAttr.pageInfo[0].pageTime,
      // startTime: cs,
      // endTime: allAnimationTime + cs,
      ...duration,
      ...position,
    });

    afterAddAsset(result);
  }
}
/**
 * 构建复制的数据
 * @returns
 */
export function buildCopyData() {
  const isDesigner = ['designer', 'module'].includes(
    getUrlParams().redirect || '',
  );
  const asset = getCurrentAsset();
  const activeAudio = getActiveAudio();
  const canvasInfo = getCanvasInfo();
  if (activeAudio) {
    const copyData = {
      type: 'audio',
      data: activeAudio,
      canvasInfo,
    };
    return copyData;
  }
  if (asset) {
    if (!asset.meta.locked) {
      const copyAsset = getCurrentAssetCopy();
      const copyData = {
        type: 'asset',
        data: copyAsset,
        canvasInfo,
      };
      return copyData;
    }
  }

  // 设计师端暂时没有复制片段需求
  if (!isDesigner) {
    const template = getCurrentTemplate().getTemplateClonedWithRender();
    return { type: 'template', data: template, canvasInfo };
  }
}
