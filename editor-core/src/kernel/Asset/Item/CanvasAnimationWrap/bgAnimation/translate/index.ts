import {
  MAX_TRANSLATE,
  ZOOM_MAX,
} from '@AssetCore/Item/CanvasAnimationWrap/bgAnimation/const';

export function getTranslateLeft(percent: number) {
  const result = -MAX_TRANSLATE * percent;
  return `translateX(${result}%) scale(${ZOOM_MAX})`;
}

export function getTranslateRight(percent: number) {
  const result = MAX_TRANSLATE * percent;
  return `translateX(${result}%) scale(${ZOOM_MAX})`;
}

export function getTranslateTop(percent: number) {
  const result = -MAX_TRANSLATE * percent;
  return `translateY(${result}%) scale(${ZOOM_MAX})`;
}

export function getTranslateBottom(percent: number) {
  const result = MAX_TRANSLATE * percent;
  return `translateY(${result}%) scale(${ZOOM_MAX})`;
}
