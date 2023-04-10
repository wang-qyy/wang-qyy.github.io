/**
 * @description 标准化工具库
 * 由于库中一些计算需要规范化，所以再次定义统一的计算逻辑
 */
import {
  AssetBaseSize,
  AssetClass,
  Coordinate,
  Position,
  VideoClip,
} from '@kernel/typing';
import { config } from '@kernel/utils/config';

/**
 * @description 统一处理元素缩放逻辑
 * @param size 元素尺寸
 * @param scale 缩放比例
 */
export function assetScale(size: AssetBaseSize, scale: number) {
  const { width, height } = size;
  const WHRatio = width / height;
  const newWidth = width * scale;
  return {
    width: newWidth,
    height: newWidth / WHRatio,
  };
}

export function getAssetSizeScale(
  oldSize: AssetBaseSize,
  newSize: AssetBaseSize,
) {
  return {
    width: newSize.width / oldSize.width,
    height: newSize.height / oldSize.height,
  };
}

/**
 * @description 计算元素宽高与相对位置的比例
 * @param size
 * @param position
 */
export function getAssetPositionScale(size: AssetBaseSize, position: Position) {
  return {
    width: position.left / size.width,
    height: position.top / size.height,
  };
}

/**
 * @description 计算元素宽高与相对位置的比例
 * @param newSize
 * @param sizeScale
 */
export function assetPositionScale(
  newSize: AssetBaseSize,
  sizeScale: AssetBaseSize,
) {
  return {
    left: newSize.width / sizeScale.width,
    top: newSize.height / sizeScale.height,
  };
}

export function assetSizeScale(size: AssetBaseSize, scale: AssetBaseSize) {
  return {
    width: size.width * scale.width,
    height: size.height * scale.height,
  };
}

/**
 * @description 计算元素等比缩放以后的实际缩放值
 * @param oldSize 缩放前尺寸
 * @param newSize 缩放后尺寸
 */
export function getAssetScale(oldSize: AssetBaseSize, newSize: AssetBaseSize) {
  return newSize.width / oldSize.width;
}

/**
 * @description 帧数转换为毫秒
 * @param frame
 */
export function frameToMS(frame: number) {
  return (frame / config.baseFrames) * 1000;
}

/**
 * @description 获取特效字的id
 * @param effect
 */
export function getFontEffectId(effect: string) {
  return effect.split('@')[0];
}

/**
 * @description 从oss获取视频帧
 * @param url
 * @param t ms
 */
export function getVideoFrameFormOss(url: string, t: number) {
  return `${url}&x-oss-process=video/snapshot,t_${t},f_jpg,w_100`;
}

/**
 * @description 计算模板的实际时长
 * @param duration
 * @param offsetTime
 */
export function calcTemplateTime(duration: number, offsetTime?: VideoClip) {
  if (!offsetTime) {
    return duration;
  }
  const [startTime, endTime] = offsetTime;
  return duration - (endTime + startTime);
}

export function positionToCoordinate(position: Position) {
  const { left: x, top: y } = position;
  return {
    x,
    y,
  };
}

export function coordinateToPosition(coordinate: Coordinate) {
  const { x: left, y: top } = coordinate;
  return {
    left,
    top,
  };
}

export const createClassName = (
  asset: AssetClass,
  showOnly: boolean,
): string => {
  let assetClassName = asset.meta.className ?? '';
  if (showOnly) {
    assetClassName += `_showOnly_${assetClassName}`;
  }
  return assetClassName;
};

/**
 * @description 如果存在嵌套组，则拿到最顶层的asset
 * @param asset
 */
export function getTopAsset(asset?: AssetClass): AssetClass | undefined {
  if (asset) {
    return asset.parent ? getTopAsset(asset.parent) : asset;
  }
}

/**
 * @description 如果存在嵌套组，则拿到最顶层的asset
 * @param number
 */
export function numberFixed(number: number): number {
  return Number(number.toFixed(2));
}

export function hasRotated(rotate?: number) {
  if (typeof rotate !== 'number') {
    return false;
  }
  return rotate % 360 > 0;
}
