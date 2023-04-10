import { BGA_ID_MAP } from './actions';

export function getBgAnimationStyle(
  id: number,
  currentTime: number,
  duration: number,
) {
  // @ts-ignore
  const { action } = BGA_ID_MAP[id] || {};
  if (action) {
    return {
      transform: action(currentTime / duration),
    };
  }
  return {};
}
