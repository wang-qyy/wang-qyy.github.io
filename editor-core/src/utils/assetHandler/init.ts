import { getCanvasInfo } from '@/store/adapter/useTemplateInfo';
import { assetMinDuration } from '@/config/basicVariable';
import {
  getRelativeCurrentTime,
  getCurrentTemplate,
  Attribute,
  Meta,
} from '@hc/editor-core';

import {
  newImage,
  newLottie,
  newMask,
  newModule,
  newVideoE,
  newSVG,
  newText,
  newSvgPath,
  newEffect,
  newQrCode,
} from './assetTemplate';
import { getAssetSizeAutoTemplate } from './assetUtils';

interface AssetBaseSize {
  width: number;
  height: number;
}

/**
 * 获取新增视频元素的默认时长
 */
export function getNewVideoAssetDuration(videoDuration: number) {
  const {
    allAnimationTime: pageTime,
    offsetTime: [cs, ce] = [0, 0],
    speed = 1,
  } = getCurrentTemplate().videoInfo;
  const currentTime = getRelativeCurrentTime() / (1 / speed);

  let duration = Math.max(assetMinDuration, pageTime - currentTime);

  duration = Math.min(duration, videoDuration);

  const endTime = Math.min(currentTime + duration, pageTime);

  const startTime = Math.max(endTime - duration, 0);

  return {
    startTime: startTime + cs,
    endTime: endTime + cs,
  };
}

/**
 * @description 计算新增元素的持续时间 默认从当前时间到片段结尾
 * @param assetDuration 指定元素时长 例如复制元素、裁剪的视频
 */
export function getNewAssetDuration(assetDuration?: number) {
  const {
    allAnimationTime: pageTime,
    offsetTime: [cs, ce] = [0, 0],
    speed = 1,
  } = getCurrentTemplate().videoInfo;
  const currentTime = getRelativeCurrentTime() / (1 / speed);

  const duration =
    assetDuration ?? Math.max(assetMinDuration, pageTime - currentTime);

  const endTime = Math.min(currentTime + duration, pageTime);
  const startTime = Math.max(endTime - duration, 0);

  return {
    startTime: startTime + cs,
    endTime: endTime + cs,
  };
}

/**
 * @description 计算出新增元素的位置
 */
export function getNewAssetPosition(size: AssetBaseSize) {
  const { width, height } = getCanvasInfo();

  return {
    posX: (width - size.width) / 2,
    posY: (height - size.height) / 2,
  };
}

// 元素添加到画布的默认大小
const defaultWidth = 500;

/**
 * 初始化图片视频size
 */
export function getNewAssetSize(params: AssetBaseSize, meta: Meta) {
  const { width, height } = params;
  let scale = defaultWidth / width;

  const canvasInfo = getCanvasInfo();
  if (meta.isBackground || meta.isOverlay) {
    // 背景元素/视频特效的大小 尽可能铺满画布

    if (canvasInfo.width > canvasInfo.height) {
      scale = canvasInfo.width / width;
    } else {
      scale = canvasInfo.height / height;
    }
  } else if (meta.type === 'effect') {
    return canvasInfo;
  } else if (width < height) {
    scale = defaultWidth / height;
  }
  let size = {
    width: width * scale,
    height: height * scale,
    assetWidth: width,
    assetHeight: height,
  };
  if (
    !meta.isBackground &&
    !meta.isOverlay &&
    meta.type !== 'effect' &&
    ['video', 'videoE', 'image', 'pic'].includes(meta.type)
  ) {
    size = getAssetSizeAutoTemplate(size);
  }
  return size;
}

export function getNewAssetTemplate(type: Meta['type']) {
  switch (type) {
    case 'text':
      return newText();
    case 'videoE':
    case 'video':
      return newVideoE();
    case 'image':
    case 'pic':
      return newImage();
    case 'SVG':
      return newSVG();
    case 'mask':
      return newMask();
    case 'module':
      return newModule();
    case 'lottie':
      return newLottie();
    case 'svgPath':
      return newSvgPath();
    case 'effect':
      return newEffect();
    case 'qrcode':
      return newQrCode();
    default:
      return { meta: {}, attribute: {}, transform: {} };
  }
}
