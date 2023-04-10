import { AssetClass, Coordinate, Position } from '@/kernel/typing';
import { getCanvasClientRect } from '@/kernel/utils/single';
import { calculateAssetPoint } from '@kernel/utils/auxiliaryLineHandler';
import { positionToCoordinate } from '@kernel/utils/StandardizedTools';

export interface ElementStyle {
  top: number;
  left: number;
  width: number;
  height: number;
  rotate?: number;
}

export interface BaseSize {
  width: number;
  height: number;
  left: number;
  top: number;
  rotate?: number;
}

export function mouseMoveDistance(
  cb: (distanceX: number, distanceY: number, mousePosition: Position) => void,
  finish?: (distanceX: number, distanceY: number) => void,
) {
  let origin: Coordinate | undefined;
  const canvasRect = getCanvasClientRect();

  const mouseMove = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;
    if (!origin) {
      origin = {
        x: currentX,
        y: currentY,
      };
    }
    // 鼠标当前的位置
    const MousePosition = {
      // @ts-ignore
      left: event.pageX - canvasRect?.left,
      // @ts-ignore
      top: event.pageY - canvasRect?.top,
    };
    cb && cb(currentX - origin.x, currentY - origin.y, MousePosition);
  };
  const removeEventListener = () => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    window.removeEventListener('mouseup', mouseUp);
    window.removeEventListener('mousemove', mouseMove);
  };

  const mouseUp = (event: MouseEvent) => {
    if (origin) {
      const currentX = event.clientX;
      const currentY = event.clientY;

      finish && finish(currentX - origin.x, currentY - origin.y);
    }
    removeEventListener();
  };

  window.addEventListener('mouseup', mouseUp);
  window.addEventListener('mousemove', mouseMove);
  return removeEventListener;
}

export function buildAuxiliaryByAssetClass(
  asset: AssetClass,
  position: Position,
) {
  const { rotate } = asset.assetTransform;
  return calculateAssetPoint(
    asset.containerSizeScale,
    positionToCoordinate(position),
    rotate,
  );
}
