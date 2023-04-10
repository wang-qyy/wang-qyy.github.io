/**
 * @description 标准化工具库
 * 由于库中一些计算需要规范化，所以再次定义统一的计算逻辑
 */
import {
  Asset,
  AssetBaseSize,
  AssetClass,
  AeA,
  AeAKw,
  AeAItem,
  AssetTime,
  Coordinate,
  Position,
  Attribute,
  VideoClip,
} from '@kernel/typing';
import { config } from '@kernel/utils/config';
import {
  AEA_DEFAULT_DURATION,
  AEA_PBR_STEP,
} from '@kernel/utils/assetHelper/const';
import { AEA_KEYS } from '@kernel/store/assetHandler/asset/const';

export function getAssetAea(data?: { aeA?: AeA }) {
  const { aeA } = data || {};
  return aeA || config.getDefaultPlaybackRate();
}

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

export function calcKwpByPbr(p: number, pbr: number) {
  return Math.round(p / pbr);
}

/**
 * @description 帧数转换为毫秒
 * @param frame
 */
export function frameToMS(frame: number) {
  return (frame / config.baseFrames) * 1000;
}

/**
 * @description 将aea动画的帧率与速率转化为持续时间
 * @param kw
 * @param pbr
 */
export function calcAeAFrameToTime(kw: AeAKw | undefined, pbr: AeAItem['pbr']) {
  if (!kw) {
    return 0;
  }
  const frames = calcKwpByPbr(kw.op - kw.ip, pbr);
  return Math.round(frameToMS(frames));
}

/**
 * @description 将aea动画的帧率与速率转化为持续时间
 * @param time
 * @param kw
 */
export function calcAeATimeToPbr(time: number, kw?: AeAKw) {
  if (!kw) {
    return 1;
  }
  const frames = (time / 1000) * config.baseFrames;
  return (kw.op - kw.ip) / frames;
}

/**
 * @description 将aea动画的帧率与速率转化为持续时间
 * @param pbr
 */
export function calcPbrToTime(pbr: AeAItem['pbr']) {
  return config.aeAnimationBaseTime / pbr;
}

export interface CalcAssetTimeType {
  startTime: Attribute['startTime'];
  endTime: Attribute['endTime'];
  aeA?: Attribute['aeA'];
}

/**
 * @description 根据动画时间计算元素实际的出入场时间
 * @param attribute
 */
export function calcAssetTime(attribute: CalcAssetTimeType) {
  const { startTime, endTime } = attribute;
  const aeA = getAssetAea(attribute);
  const assetTime = {
    startTime,
    endTime,
  };
  if (aeA.i.duration) {
    assetTime.startTime = Math.round(startTime - aeA.i.duration);
  }
  if (aeA.o.duration) {
    assetTime.endTime = Math.round(endTime + aeA.o.duration);
  }
  return assetTime;
}

/**
 * @description 根据动画时间计算元素实际的出入场时间
 * @param attribute
 * @param pageTime 模板时长
 */
export function calcAssetTimeByTemplate(
  attribute: CalcAssetTimeType,
  pageTime: number,
) {
  const { startTime = 0, endTime = 0 } = attribute;
  const {
    i: { duration: iD = 0 },
    o: { duration: oD = 0 },
  } = getAssetAea(attribute);
  const assetTime = {
    startTime,
    endTime,
  };
  const assetDuration = {
    startTime,
    endTime,
  };
  /**
   * @description 超出部分，需要处理为合理的数据类型
   */
  assetTime.startTime = startTime - iD;
  if (assetTime.startTime < 0) {
    assetDuration.startTime = iD;
    assetTime.startTime = 0;
  }

  assetTime.endTime = endTime + oD;
  if (assetTime.endTime > pageTime) {
    assetDuration.endTime = pageTime - oD;
    assetTime.endTime = pageTime;
  }
  return {
    ...assetDuration,
    rt_assetTime: assetTime,
  };
}

/**
 * @description 计算元素的持续时间
 * @param assetTime
 */
export function getDurationByAssetTime(assetTime?: AssetTime) {
  if (!assetTime) {
    return 0;
  }
  return assetTime.endTime - assetTime.startTime;
}

/**
 * @description 动画时长取整
 * @param duration
 */
export function aeaDurationRound(duration: number) {
  return Math.floor(duration / 100) * 100;
}

/**
 * @description aea动画限制
 * @param duration
 * @param init 是否是初始化设置
 */
export function calcAaADuration(duration: number, init = false) {
  if (duration < 100) {
    duration = 100;
  }
  if (init && duration > 1000) {
    duration = 1000;
  }
  if (duration > 2000) {
    duration = 2000;
  }

  return aeaDurationRound(duration);
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

/**
 * @description 计算尾部转场的出入场时间
 * @param assetTime
 * @param pageTime
 * @param offsetTime
 */
export function calcAfterTransferTime(
  assetTime: AssetTime,
  pageTime: number,
  offsetTime: VideoClip = [0, 0],
) {
  const duration = assetTime.endTime - assetTime.startTime;
  const [cs, ce] = offsetTime;
  const offsetEnd = pageTime - ce;
  return {
    startTime: offsetEnd - duration,
    endTime: offsetEnd,
  };
}

/**
 * @description 计算头部转场的出入场时间
 * @param assetTime
 * @param pageTime
 * @param offsetTime
 */
export function calcBeforeTransferTime(
  assetTime: AssetTime,
  pageTime: number,
  offsetTime: VideoClip = [0, 0],
) {
  const duration = assetTime.endTime - assetTime.startTime;
  const [cs] = offsetTime;
  return {
    startTime: cs,
    endTime: cs + duration,
  };
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
 * @description 计算动画持续时间
 * @param assetTime
 */
export function calcAssetDurationByAssetTime(assetTime: AssetTime) {
  return assetTime.endTime - assetTime.startTime;
}

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
 * @description 根据时间，获取最合适的pbr
 * @param pbr
 * @param aea
 */
export function getAeaItemDurationByPbrMode(
  pbr: Record<keyof AeA, number>,
  aea?: AeA,
): Record<keyof AeA, number> {
  const duration: Record<keyof AeA, number> = {
    i: 0,
    s: 0,
    o: 0,
  };
  AEA_KEYS.forEach((key) => {
    const item = pbr[key];
    const aeaItem = aea?.[key];
    duration[key] = calcAeAFrameToTime(aeaItem?.kw, item);
  });
  return duration;
}

/**
 * @description 如果存在嵌套组，则拿到最顶层的asset
 * @param number
 */
export function numberFixed(number: number): number {
  return Number(number.toFixed(2));
}

/**
 * @description 根据时间，获取最合适的pbr
 * @param time
 * @param kw
 */
export function getLimitAeaPbrByTime(time: number, kw: AeAKw): number {
  const duration = calcAeAFrameToTime(kw, 1);
  const step = duration / 2;
  return Math.floor(time / duration / step) * step;
}

export function hasRotated(rotate?: number) {
  if (typeof rotate !== 'number') {
    return false;
  }
  return rotate % 360 > 0;
}
