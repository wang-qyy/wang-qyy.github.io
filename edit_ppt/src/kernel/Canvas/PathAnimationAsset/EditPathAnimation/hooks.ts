import { Asset, CanvasInfo } from '@/kernel/typing';
import { getCenterPointFromSize } from '@/kernel/utils/mouseHandler/mouseHandlerHelper';
import { useMemo } from 'react';

const usePathAnimationStyle = (asset: Asset, canvasInfo: CanvasInfo) => {
  const getCenterPoint = () => {
    if (asset) {
      const { width, height } = asset?.attribute;
      const { posX: left, posY: top } = asset?.transform;
      // 参考点位置
      const { x: originLeft, y: originTop } = getCenterPointFromSize(
        { left, top },
        { width, height },
      );
      return {
        left: originLeft,
        top: originTop,
      };
    }
    return {};
  };
  const holderStyle = useMemo(() => {
    return {
      width: canvasInfo.width,
      height: canvasInfo.height,
      background: 'pink',
      position: 'absolute',
      display: 'none',
    };
  }, [asset?.meta]);
  return {
    getCenterPoint,
    holderStyle,
  };
};
export default usePathAnimationStyle;
