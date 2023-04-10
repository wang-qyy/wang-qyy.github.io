import { EffectInfo, Filters } from '../typing';

export enum PlayStatus {
  Stopped = -1,
  Paused,
  Playing,
}
// 蒙版子元素类型
export const MaskChildAssetType = ['image', 'pic', 'video', 'videoE'];

// 滤镜调节默认值
export const defaultFilters: Filters = {
  blur: 0, // 模糊 [0 ~ 1]
  brightness: 0, // 亮度 [-1 ~ 1]
  contrast: 0, // 对比度 [-1 ~ 1]
  'gamma-r': 1, // red通道 [0.01 ~ 2.2]
  'gamma-g': 1, // green 通道 [0.01 ~ 2.2]
  'gamma-b': 1, // blue 通道 [0.01 ~ 2.2]
  hue: 0, // 色相 [-2 ~ 2]
  saturate: 0, // 饱和度 [-1 ~ 1]
  sharpen: 0, // 锐化 [0 ~ 1]
  strong: 1, // 滤镜强度 [0 ~ 1]
};

export const defaultEffect: EffectInfo = {
  sepia: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  invert: 0,
  hue: 0,
  blur: 0,
};

// 元素id前缀
export const assetIdPrefix = 'xdd-asset-';
