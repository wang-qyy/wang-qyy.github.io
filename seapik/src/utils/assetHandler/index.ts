import { Asset, AssetClass, addAssetInTemplate, getCanvasInfo } from '@/kernel';
import { getNewAssetPosition } from './init';

/**
 * @description 添加元素
 * @param {Asset} asset
 * @param {boolean} autoPosition
 */
export async function addAsset(params: {
  asset: Asset;
  autoPosition?: boolean;
}) {
  const { asset, autoPosition = true } = params;
  const { meta, attribute } = asset;

  // 自动计算元素默认位置
  if (autoPosition) {
    const position = getNewAssetPosition(attribute);
    Object.assign(asset.transform, position);
  }

  const result = await addAssetInTemplate(asset);

  return result;
}
