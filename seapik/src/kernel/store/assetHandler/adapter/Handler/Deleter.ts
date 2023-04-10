import assetHandler from '@kernel/store/assetHandler';
import { Assets } from '@kernel/typing';

export function deleteAssetInTemplate(id: number) {
  return assetHandler.currentTemplate.removeAsset(id);
}

export function deleterAssetsById(ids: number[]) {
  ids.forEach(id => {
    deleteAssetInTemplate(id);
  });
}

export function deleterAssets(assets: Assets) {
  assets.forEach(asset => {
    deleteAssetInTemplate(asset.meta.id);
  });
}
