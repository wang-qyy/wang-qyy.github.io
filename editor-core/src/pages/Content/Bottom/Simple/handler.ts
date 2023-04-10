import { sortBy } from 'lodash-es';
import { getLayerAssets, Asset } from '@hc/editor-core';

export function getReplaceAssets() {
  const assets = getLayerAssets();

  const texts: Asset[] = [];
  const images: Asset[] = [];

  const newAssets = sortBy(assets, o => o.attribute.startTime);

  newAssets.forEach(asset => {
    if (!asset.meta.isBackground && !asset.meta.locked) {
      switch (asset.meta.type) {
        case 'text':
          texts.push(asset);
          break;

        case 'mask':
        case 'video':
        case 'videoE':
        case 'image':
        case 'pic':
          images.push(asset);
          break;
        default:
      }
    }
  });

  return { texts, images };
}
