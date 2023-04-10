import { AeA, Animation } from '@kernel/typing';

export const AEA_TEXT_DURATION = 1000;
export const AEA_KEYS: Array<keyof AeA> = ['i', 'o', 's'];
export const ANIMATION_KEYS: Array<keyof Animation> = ['stay', 'exit', 'enter'];
export const ANIMATION_TO_AEAKEY: Record<keyof Animation, keyof AeA> = {
  stay: 's',
  exit: 'o',
  enter: 'i',
};
export const getDefaultAuxiliary = () => ({
  vertical: {
    start: 0,
    center: 0,
    end: 0,
  },
  horizontal: {
    start: 0,
    center: 0,
    end: 0,
  },
});
