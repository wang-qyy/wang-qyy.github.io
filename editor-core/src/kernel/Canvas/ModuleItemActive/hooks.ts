import { useGetModuleItemActive, getMoveAsset } from '@kernel/store';

import { CSSProperties } from 'react';
import { buildGeneralStyleInHandler } from '@kernel/utils/assetHelper/pub';

export function useAssetsSelect(): CSSProperties {
  const asset = useGetModuleItemActive();
  const moveAsset = getMoveAsset();
  const module = asset?.parent;
  if (!moveAsset && asset && !module?.tempData.rt_inTransforming) {
    return buildGeneralStyleInHandler(asset);
  }
  return { display: 'none' };
}
