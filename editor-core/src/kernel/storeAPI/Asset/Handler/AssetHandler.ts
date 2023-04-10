import assetHandler from '@kernel/store/assetHandler';
import { Asset, AssetClass, Attribute, TemplateClass } from '@/kernel/typing';
import { replaceAsset, getAssetRtInfo } from '@kernel/store';
import {
  multiSelectToModule,
  moduleToMultiSelect,
} from '@kernel/store/assetHandler/adapter/Handler/AssetSelect';
import { reportChange } from '@kernel/utils/config';
import { isMaskType, isTempModuleType } from '@kernel/utils/assetChecker';
import { removeAssetInTemplate } from '@kernel/store/assetHandler/adapter/Handler/BaseHandler';
import { highlightAssetsHandler } from '@kernel/storeAPI/Asset/utils';

import {
  assetUpdater,
  replaceWholeAssetByAssetId,
  replaceAssetBySelf,
} from '@/kernel/store';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { setInMaskStatus } from '@/kernel/store/assetHandler/adapter';
import { buildTransform } from '@/kernel/store/assetHandler/utils';
import { buildNewSizeByOrigin } from '@/kernel/utils/assetHelper/formater/dataBuilder';
import { replaceSvgModelPic } from '@/kernel/utils/single';
import { setVideoClipTime } from '@/kernel/storeAPI/Asset/Handler/Updater';
import { setAssetActiveHandler } from '@kernel/store/assetHandler/adapter';
import { formatEffectColorData } from '..';

export { assetUpdater, replaceWholeAssetByAssetId, replaceAssetBySelf };

/**
 * @description 添加元素实例，用于先实例化，后添加
 * @param asset
 * @param template
 */
export function addAssetClassInTemplate(
  asset: AssetClass,
  template?: TemplateClass,
) {
  const { currentTemplate } = assetHandler;
  const target = template ?? currentTemplate;
  if (target) {
    target.addAssets([asset]);
  }
}
/**
 * @description 清空文字编辑状态
 */
export function clearTextEditActive() {
  if (assetHandler.textEditActive) {
    assetHandler.setTextEditActive(undefined);
  }
}
//
export async function addAssetInTemplate(
  asset: Asset,
  template?: TemplateClass,
) {
  template = template || assetHandler.currentTemplate;

  // 如果添加的元素是背景元素 先判断是否有背景元素  如果有 把背景删除掉
  if (asset.meta.isBackground) {
    const backgroundAsset = template.assets.find(
      item => item.meta.isBackground,
    );
    if (backgroundAsset) {
      removeAssetInTemplate(template, backgroundAsset);
    }
    getAssetRtInfo(asset);
  } else if (asset.meta.isOverlay) {
    // 如果添加的元素是视频特效元素 先判断是否有视频特效元素  如果有 把视频特效元素删除掉
    const effectAsset = template.assets.find(item => item.meta.isOverlay);
    if (effectAsset) {
      removeAssetInTemplate(template, effectAsset);
    }
    getAssetRtInfo(asset);
  } else {
    await getAssetRtInfo(asset);
  }
  if (asset.attribute.effectColorful) {
    asset.attribute.effectColorful.effect = formatEffectColorData(
      asset.attribute.effectColorful.effect,
    );
  }
  reportChange('addAssetInTemplate', true);
  return template.addAsset(asset, (asset: AssetClass) => {
    if (asset.meta.type === 'lottie') {
      asset.setTempData({
        rt_lottiePreview: true,
      });
    }
    return asset;
  });
}

interface AddCopiedAssetParams {
  meta?: { trackId: string };
  transform?: {
    posX: number;
    posY: number;
  };
  attribute: { startTime: number; endTime: number };
}

/**
 * @description 添加复制元素
 * */
export function addCopiedAsset(asset: Asset, data: AddCopiedAssetParams) {
  const assetClass = new AssetItemState(asset);

  const { transform, attribute, meta } = data;
  assetClass.update({
    meta: { ...meta, trackId: undefined },
    transform: {
      ...transform,
      zindex: assetHandler.currentTemplate.zIndex.max + 1,
    },
  });

  assetClass.updateAssetDuration(attribute);

  addAssetClassInTemplate(assetClass, assetHandler.currentTemplate);

  reportChange('addCopiedAsset', true);
  return assetClass;
}

/**
 * @description 订阅视频裁剪数据
 */
export function useVideoClipByObserver(record?: AssetItemState) {
  let asset = record || assetHandler?.active;

  if (asset) {
    const { meta, assets } = asset;
    if (meta.type === 'mask' && assets?.length) {
      [asset] = assets;
    }
  }

  const state = {
    startTime: asset?.attribute?.cst ?? -1,
    endTime: asset?.attribute?.cet ?? -1,
    isLoop: !!asset?.attribute?.isLoop,
  };

  return {
    update: setVideoClipTime,
    value: state,
  };
}

/**
 * 删除蒙版 先删除子元素-再删除蒙版元素
 */
export function removeMaskAsset(asset: AssetClass) {
  // @ts-ignore
  if (asset) {
    if (asset.assets.length > 0) {
      asset.setChildren([]);
    } else {
      removeAssetInTemplate(assetHandler.currentTemplate, asset);
    }
    reportChange('removeMaskAsset', true);
  }
}

/**
 * @description 删除元素
 * @param asset asset.meta.id
 */
export function removeAsset(asset: AssetClass) {
  if (isTempModuleType(asset)) {
    const { assets } = asset;

    assets.forEach(item => {
      removeAssetInTemplate(item.template, asset);
    });

    reportChange('removeTempModule', true);
  } else if (isMaskType(asset) && !asset?.meta.isClip) {
    removeMaskAsset(asset);
  } else {
    removeAssetInTemplate(asset.template, asset);
    reportChange('removeAsset', true);
  }
}
/**
 * @description 选中可编辑元素
 * @param assetId
 */
export function activeEditableAsset(asset: AssetClass) {
  const { setEditActive, setModuleItemActive } = assetHandler;

  const { parent } = asset;
  if (parent) {
    setEditActive(parent);
    setModuleItemActive(asset);
  } else {
    setEditActive(asset);
  }
}

/**
 * @description 选中当前片段的可编辑元素
 * @param assetId
 */
export function activeEditableAssetInTemplate(
  assetId: number,
  parent?: AssetClass,
) {
  const { assets = [] } = assetHandler.currentTemplate;

  const assetList = parent ? parent.assets : assets;

  const asset = assetList.find(item => item.meta.id === assetId);
  if (asset) {
    activeEditableAsset(asset);
  }
  // if (parent) {
  //   setEditActive(parent);
  //   setModuleItemActive(asset);
  // } else {
  //   setEditActive(asset);
  // }
}

/**
 * @description 检测旋转状态
 */
export function useRotateStatusByObserver() {
  return { inRotating: assetHandler.status.inRotating };
}

/**
 * @description 检测拖动状态
 */
export function useMoveStatusByObserver() {
  return assetHandler.status.inMoving;
}

/**
 * @description 检测替换状态
 */
export function useReplaceStatusByObserver() {
  const { inReplacing } = assetHandler.status;

  function startReplace(asset?: AssetItemState) {
    const currentAsset = asset ?? assetHandler.currentAsset;
    if (currentAsset) {
      assetHandler.setStatus({
        inReplacing: true,
      });
    }
  }

  function endReplace(asset?: AssetItemState) {
    const currentAsset = asset ?? assetHandler.currentAsset;
    if (currentAsset) {
      assetHandler.setStatus({
        inReplacing: false,
      });
    }
  }

  return {
    inReplacing,
    startReplace,
    replaceAsset,
    endReplace,
  };
}

/**
 * @description 元素选中框显示状态
 */
export function setHideTransformerBoxStatus(status: boolean) {
  assetHandler.setStatus({ hideTransformerBox: status });
}

/**
 * @description 元素替换
 */
export function useAssetReplaceByObserver() {
  const { inReplacing } = assetHandler.status;
  const asset = inReplacing ? assetHandler.currentAsset : undefined;

  function startClip() {
    assetHandler.setStatus({
      inReplacing: true,
    });
  }

  function endClip() {
    assetHandler.setStatus({
      inReplacing: false,
    });
  }

  return {
    startClip,
    endClip,
    inReplacing,
    asset,
  };
}

export function ungroupModule(asset: AssetClass) {
  moduleToMultiSelect(asset);
  reportChange('ungroupModule', true);
}

export function groupModule() {
  multiSelectToModule();
  reportChange('groupModule', true);
}

// todo splitMaskAsset
/**
 * 拆分视频蒙版元素
 */
export function splitMaskAsset() {
  const { currentAsset, currentTemplate } = assetHandler;
  if (
    currentAsset &&
    isMaskType(currentAsset) &&
    !currentAsset.meta.isClip &&
    currentAsset.assets &&
    currentAsset.assets.length > 0
  ) {
    const childAsset = currentAsset.assets[0].getAssetCloned();
    const newAsset = new AssetItemState(childAsset);
    setInMaskStatus(false);
    currentAsset.setChildren([]);
    assetUpdater(
      newAsset,
      buildTransform({
        posX: newAsset.transform.posX + 50,
        posY: newAsset.transform.posY + 50,
      }),
    );
    addAssetClassInTemplate(newAsset, currentTemplate);
    reportChange('splitMaskAsset', true);
  }
}

/**
 * @description 高亮可编辑元素
 * @param assets
 */
export function highlightEditableAssets(assets: AssetClass[]) {
  highlightAssetsHandler.set(
    assets.filter(o => o.meta.type !== 'effect'),
    3000,
  );
}

/**
 * 批量删除图层
 * @param ids
 */
export function removeAssetBatch(ids: number[]) {
  ids.forEach(item => {
    assetHandler.currentTemplate.removeAsset(item);
  });
  reportChange('removeAssetBatch', true);
}

/**
 * @description 替换视频蒙版
 * @param onChange 替换回调
 */
export async function replaceMask(
  onChange: (attribute: Attribute) => Partial<Attribute>,
) {
  const { currentAsset } = assetHandler;
  if (currentAsset) {
    const { attribute, assets = [] } = currentAsset;
    let { width, height } = attribute;
    const newAttr = onChange(attribute);
    if (newAttr?.width && newAttr?.height && assets.length > 0) {
      const limitMax = {
        x: assets[0].attribute.width + assets[0].transform.posX,
        y: assets[0].attribute.height + assets[0].transform.posY,
      };
      const { width: width2 = 0, height: height2 = 0 } = buildNewSizeByOrigin(
        { width: newAttr.width, height: newAttr.height },
        { width, height },
        limitMax.x,
        limitMax.y,
      );
      width = width2;
      height = height2;
      newAttr.rt_svgString = replaceSvgModelPic(newAttr.rt_svgString);

      currentAsset.update(
        {
          attribute: {
            ...newAttr,
            width,
            height,
          },
        },
        false,
      );
      reportChange('replaceAsset', true);
    }
  }
}

/**
 * @description 替换整个元素元素
 * @param onChange 替换回调
 */
export async function replaceWholeAsset(opts: {
  data: Asset;
  asset?: AssetClass;
  save?: boolean;
}) {
  const { data, asset, save } = opts;
  const { active } = assetHandler;

  const targetAsset = asset ?? active;
  if (targetAsset) {
    // const newAsset = onChange(targetAsset);
    // if (newAsset.attribute) {
    //   newAsset.attribute.colors = {};
    //   newAsset.attribute.svgStretch = undefined;
    //   newAsset.attribute.svgStrokes = undefined;
    // }

    await getAssetRtInfo(data);

    targetAsset.replaceAssetSelf(data);
    save && reportChange('replaceWholeAsset', true);

    return targetAsset;
  }
}
export default function setAssetChildren(childAsset: Asset[]) {
  const { currentAsset } = assetHandler;
  if (currentAsset) {
    currentAsset.buildAssets(childAsset, true);
  }
}

export function multiSelectAsset(asset: AssetClass) {
  setAssetActiveHandler.toggleSelect(asset);
}
