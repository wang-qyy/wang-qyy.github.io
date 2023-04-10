import { AssetItemProps } from '@kernel/typing';
import { CSSProperties } from 'react';
import { buildGeneralStyle } from '@kernel/utils/assetHelper/pub';

export function useModuleStyle({ asset }: AssetItemProps) {
  let style: CSSProperties = buildGeneralStyle(asset);
  const { rt_itemScale = 1 } = asset?.tempData || {};
  if (!asset.assets.length) {
    style = {
      display: 'none',
    };
  }

  style.transform = `scale(${rt_itemScale}) translateZ(0px)`;
  style.transformOrigin = `0 0 0`;
  return style;
}
