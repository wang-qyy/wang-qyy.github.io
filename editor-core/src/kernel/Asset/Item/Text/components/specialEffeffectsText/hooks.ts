import { AssetClass } from '@/kernel/typing';
import { CSSProperties, useMemo } from 'react';

export const useTextScaleStyle = (asset: AssetClass) => {
  const style: CSSProperties = useMemo(() => {
    if (asset?.tempData?.rt_itemScale) {
      return {
        transform: `scale(${asset?.tempData?.rt_itemScale}) translateZ(0px)`,
        transformOrigin: '0 0',
      };
    }
    return {};
  }, [asset?.tempData?.rt_itemScale]);
  return { style };
};
