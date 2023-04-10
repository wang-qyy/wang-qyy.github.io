import {
  ZOOM_SCALE,
  ZOOM_MIN,
  ZOOM_MAX,
} from '@AssetCore/Item/CanvasAnimationWrap/bgAnimation/const';

export function getZoomIn(percent: number) {
  const result = ZOOM_MIN + ZOOM_SCALE * percent;
  return `scale(${result},${result})`;
}

export function getZoomOut(percent: number) {
  const result = ZOOM_MAX - ZOOM_SCALE * percent;
  return `scale(${result},${result})`;
}
