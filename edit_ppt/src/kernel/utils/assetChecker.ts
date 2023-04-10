import { Asset, AssetClass, Attribute, Position, VideoStatus } from '@/kernel';
import { config } from '@kernel/utils/config';
import {
  CANT_SET_TEXT_ANIMATION,
  EFFECT_COLORFUL_LINEAR,
  IMAGE_TYPES,
  VIDEO_TYPES,
} from '@kernel/utils/assetHelper/const';
import { calcRectCoords } from '../store';
import AssetItemState from '../store/assetHandler/asset';
import { getAssetInnerDragViewScale } from '../store/assetHandler/utils';
import { CanvasInfo, SignatureEffectWord } from '../typing';

// 允许选中 但不可操作元素
export function isNonEditable(asset?: AssetClass) {
  return asset && ['effect'].includes(asset.meta.type);
}

// 是否允许用户修改
export function assetIsEditable(asset: AssetClass) {
  if (asset) {
    const { meta } = asset;
    // 转场动画不可编辑和选中
    if (meta.isTransfer || meta.isLogo || meta.type === 'effect') {
      return false;
    }

    if (config.backgroundEditable) {
      return !meta.locked;
    }

    return !meta.isBackground && !meta.locked;
  }
  return false;
}

/**
 * @description 判断是否是旧版动画
 * @param attribute
 */
export function isAssetAnimation(attribute?: Attribute) {
  if (!attribute) return false;
  const { animation, stayEffect, bgAnimation = { id: 0 } } = attribute;
  if (animation || bgAnimation || stayEffect) {
    const animationEnterBaseId = animation?.enter?.baseId ?? 0;
    const animationExitBaseId = animation?.exit?.baseId ?? 0;
    const animationStayBaseId = animation?.stay?.baseId ?? 0;

    return (
      animationEnterBaseId > 0 ||
      animationExitBaseId > 0 ||
      animationStayBaseId > 0 ||
      bgAnimation.id > 0 ||
      stayEffect
    );
  }

  return false;
}

/**
 * @description 判断是否是模块类型
 * @param asset
 */
export function isModuleType(asset?: AssetClass) {
  return asset?.meta?.type === 'module';
}

/**
 * @description 判断是否是模块类型
 * @param asset
 */
export function isTempModuleType(asset?: AssetClass) {
  return asset?.meta?.type === '__module';
}

/**
 * @description 判断是否是模块类型
 * @param asset
 */
export function isTransferAsset(asset?: AssetClass) {
  return asset?.meta?.isTransfer;
}

/**
 * @description 判断是否是模块类型
 * @param asset
 */
export function isLogoAsset(asset?: AssetClass) {
  return asset?.meta?.isLogo;
}

/**
 * @description  背景不可添加为组元素，
 * @param asset
 */
export function canAssetAddModule(asset?: AssetClass) {
  return (
    asset &&
    assetIsEditable(asset) &&
    !asset.meta?.isBackground &&
    !isTempModuleType(asset)
  );
}

/**
 * @description 判断是否是蒙版类型
 * @param asset
 */
export function isMaskType(asset?: AssetClass | Asset) {
  return asset?.meta?.type === 'mask';
}
/**
 * @description 判断是否是lottie类型
 * @param asset
 */
export function isLottieType(asset?: AssetClass | Asset) {
  return asset?.meta?.type === 'lottie';
}
/**
 * @description 元素是否有父元素
 * @param asset
 */
export function assetHasParent(asset?: AssetClass) {
  return asset && asset.parent;
}

/**
 * @description 是否是图片元素
 * @param asset
 */
export function isImageAsset(asset?: AssetClass | Asset) {
  return asset && IMAGE_TYPES.includes(asset.meta.type);
}

/**
 * @description 是否是视频元素
 * @param asset
 */
export function isVideoAsset(asset?: AssetClass | Asset) {
  return asset && VIDEO_TYPES.includes(asset.meta.type);
}

// 是否允许用户选中
export function assetIsSelectable(asset: AssetClass | Asset) {
  if (asset) {
    const { meta } = asset;
    // 转场动画不可编辑和选中
    if (meta.isTransfer || meta.isLogo || meta.isWatermark) {
      return false;
    }

    if (config.backgroundEditable) {
      return true;
    }
    return !meta.isBackground;
  }
  return false;
}

/**
 * @description 元素在某个时间段是否可编辑
 * @param asset
 * @param currentTime
 */
export function assetCanEditInTargetTime(
  asset: AssetClass | undefined,
  currentTime: number,
) {
  if (!asset) {
    return false;
  }

  // 如果不允许修改直接返回数据，避免后续计算消耗性能
  if (asset.meta.hidden) {
    return false;
  }
  const { startTime, endTime } = asset.assetDuration;
  // 处于播放中
  return currentTime >= startTime && currentTime < endTime;
}

/**
 * @description 元素是否可编辑
 * @param asset
 * @param videoStatus
 */
export function assetCanEdit(
  asset: AssetClass | undefined,
  videoStatus: VideoStatus,
) {
  return assetCanEditInTargetTime(asset, videoStatus.currentTime);
}

/**
 * @description 元素是否贯穿模板现实
 * @param asset
 */
export function assetAlwaysVisible(asset?: AssetClass | Asset) {
  if (!asset) {
    return;
  }
  return asset.meta?.isAlwaysVisible;
}

/**
 * @description 元素中是否存在tempModule
 * @param assets
 */
export function hasTempModuleInAssets(assets: AssetClass[]) {
  return assets.some((asset) => isTempModuleType(asset));
}

/**
 * @description 元素是否发生了旋转
 * @param asset
 */
export function hasRotate(asset?: AssetClass | Asset) {
  if (!asset) {
    return false;
  }
  const { rotate } = asset.transform;
  if (!rotate) {
    return false;
  }
  return rotate % 360 !== 0;
}

/**
 * @description 是否是有效数据
 * @param asset
 */
export function isValidAssets(asset?: AssetClass | Asset) {
  if (!asset) {
    return false;
  }
  const { type, isTransfer, isLogo, isWatermark } = asset.meta;
  return !isLogo && !isTransfer && !isWatermark;
}

/**
 * 判断原始是否已经拖出画布外面
 * @param asset
 * @returns
 */
export function checkAssetMoveOutCanvas(
  asset: AssetClass | undefined,
  canvasInfo: CanvasInfo,
) {
  if (!asset) {
    return false;
  }
  const { posX, posY } = asset.transform;
  const { width, height } = asset.attribute;
  // 元素在画布的上面
  const sign1 = posY + height < 0;
  // 元素在画布的下面
  const sign2 = posY > canvasInfo.height;
  // 元素在画布的左边
  const sign3 = posX + width < 0;
  // 元素在画布的右边
  const sign4 = posX > canvasInfo.width;
  if (sign1 || sign2 || sign3 || sign4) {
    return true;
  }
  return false;
}

/**
 * 检查鼠标是否在蒙版的可拖拽放置区域以内
 */
export function checkIsInnerMaskDragView(mask: AssetClass, position: Position) {
  const rect = getAssetInnerDragViewScale(mask);
  const coords = calcRectCoords(rect);
  return (
    coords.xMax > position.left &&
    coords.xMin < position.left &&
    coords.yMax > position.top &&
    coords.yMin < position.top
  );
}

// 如果是mask类型 则取第一个子元素
export const getRealAsset = (asset: AssetItemState) => {
  const realAsset =
    isMaskType(asset) && asset?.assets?.length ? asset.assets[0] : asset;
  return realAsset;
};
export function effectColorfulIsLinear(id: string | number) {
  return EFFECT_COLORFUL_LINEAR.includes(Number(id));
}
export function effectTextIsLinear(id: string | number) {
  return CANT_SET_TEXT_ANIMATION.includes(Number(id));
}

export function canSetTextAnimation(asset?: AssetClass) {
  if (!asset) {
    return false;
  }
  if (asset?.meta.type !== 'text') {
    return false;
  }
  let sign = true;
  const { effectColorful, effect } = asset.attribute;
  if (effectColorful && effectColorful.resId) {
    sign = !effectColorfulIsLinear(effectColorful.resId);
  }
  if (effect) {
    const effectId = Number(effect.split('@')[0]);
    sign = !effectTextIsLinear(effectId);
  }
  return sign;
}
