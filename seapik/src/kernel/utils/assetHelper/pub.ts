import { AssetClass } from '@/kernel';

/**
 * @description 通过asset计算常规样式
 * @param asset
 */
export function buildGeneralStyle(asset: AssetClass) {
  const { rotate, opacity, zIndex } = asset.assetTransform;

  return {
    ...asset.containerSize,
    ...asset.assetPosition,
    opacity,
    zIndex,
    transform: `rotate(${rotate}deg)`,
  };
}

/**
 * @description 通过asset计算常规样式
 * @param asset
 */
export function buildGeneralStyleInHandler(asset: AssetClass) {
  const { opacity, zIndex } = asset.assetTransform;
  const { width, height } = asset.containerSizeScale;
  const { left, top, rotate } = asset.assetAbsolutePositionScale;
  return {
    width,
    height,
    top,
    left,
    opacity,
    zIndex,
    transform: `rotate(${rotate}deg)`,
  };
}
