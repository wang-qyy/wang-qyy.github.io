import {
  getZoomIn,
  getZoomOut,
} from '@AssetCore/Item/CanvasAnimationWrap/bgAnimation/scale';
import {
  getTranslateBottom,
  getTranslateLeft,
  getTranslateRight,
  getTranslateTop,
} from '@AssetCore/Item/CanvasAnimationWrap/bgAnimation/translate';

export const BGA_ID_MAP = {
  1: {
    action: getZoomOut,
    name: '缩小',
  },
  2: {
    action: getZoomIn,
    name: '放大',
  },
  3: {
    action: getTranslateLeft,
    name: '向左移动',
  },
  4: {
    action: getTranslateRight,
    name: '向右移动',
  },
  5: {
    action: getTranslateTop,
    name: '向上移动',
  },
  6: {
    action: getTranslateBottom,
    name: '向下移动',
  },
};
export const BGA_ID_List = Object.keys(BGA_ID_MAP).map(Number);
