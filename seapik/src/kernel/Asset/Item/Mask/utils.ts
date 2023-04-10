import type { Asset, AssetClass } from '@kernel/typing';
import { CSSProperties } from 'react';
import { useSvgHelper } from '@AssetCore/Item/SVG/utils';

export { useSvgHelper };

export function useContainerSize(asset: AssetClass | Asset) {
  const { width, height } = asset.attribute;
  const size: CSSProperties = {
    width,
    height,
  };
  return {
    size,
  };
}
