import React, { CSSProperties, useMemo } from 'react';

import { getHighlightAssets } from '@kernel/store';
import { highlightAssetsHandler } from '@kernel/storeAPI/Asset/utils';
import { buildGeneralStyleInHandler } from '@kernel/utils/assetHelper/pub';

export function useAssetHighlight() {
  const assets = getHighlightAssets();

  return useMemo<CSSProperties[]>(() => {
    return assets.map(item => {
      return {
        ...buildGeneralStyleInHandler(item),
        animation: `breathe ${highlightAssetsHandler.delay}ms 1 cubic-bezier(0.000, 1.000, 1.000, 0.000)`,
      };
    });
  }, [assets]);
}
