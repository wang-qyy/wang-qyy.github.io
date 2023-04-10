import { getCanvasInfo } from '@/kernel';

interface AssetBaseSize {
  width: number;
  height: number;
}

/**
 * @description 计算出新增元素的剧中位置
 */
export function getNewAssetPosition(size: AssetBaseSize) {
  return {
    posX: getHorizontalPosition('center', size.width),
    posY: getVerticalPosition('middle', size.height),
  };
}

/**
 * @description 获取水平位置
 * @param position  'left' | 'center' | 'right'
 * @param assetWidth 元素宽度
 * @returns
 */
export function getHorizontalPosition(
  position: 'left' | 'center' | 'right',
  assetWidth: number,
) {
  const { width } = getCanvasInfo();

  if (position === 'left') {
    return 20;
  } else if (position === 'right') {
    return width - assetWidth - 20;
  }

  return (width - assetWidth) / 2;
}

/**
 * @description 获取垂直位置
 * @param position  'top' | 'middle' | 'bottom',
 * @param assetWidth 元素高度
 * @returns
 */
export function getVerticalPosition(
  position: 'top' | 'middle' | 'bottom',
  assetHeight: number,
) {
  const { height } = getCanvasInfo();
  if (position === 'top') {
    return 20;
  } else if (position === 'bottom') {
    return height - assetHeight - 20;
  }

  return (height - assetHeight) / 2;
}
