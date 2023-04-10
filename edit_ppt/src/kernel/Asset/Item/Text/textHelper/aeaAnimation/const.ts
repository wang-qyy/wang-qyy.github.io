import { AeaItemKey } from './typing';

export const aeaKey: Record<AeaItemKey, AeaItemKey> = {
  i: 'i',
  s: 's',
  o: 'o',
};
export const aeAKey = Object.keys(aeaKey) as AeaItemKey[];

export const baseFrames = 30;

export const frameInterval = 1 / baseFrames;

export const defaultStyle = {
  opacity: 1,
  transformOriginX: 0,
  transformOriginY: 0,
  rotate: 0,
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
};

export const startKeys = ['opacity', 'rotate', 'scaleX', 'scaleY', 'scaleZ'];
export const kwDistanceKeys = ['translateX', 'translateY', 'translateZ'];
export const aeADistanceKeys = [
  'translateX',
  'translateY',
  'translateZ',
  'transformOriginX',
  'transformOriginY',
  'transformOriginZ',
];
