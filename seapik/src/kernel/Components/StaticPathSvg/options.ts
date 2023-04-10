import { GradientType } from '@/kernel/typing';

export const getId = (gradient: GradientType) => {
  const {
    angle,
    // colorStops: ColorStop[],
    colorStops,
    coords: { x1, y1, x2, y2 },
  } = gradient;
  const colors = colorStops.reduce((str, t) => {
    const {
      color: { r, g, b, a },
      offset,
    } = t;
    str += `${r}${g}${b}${a}${offset}`;
    return str;
  }, '');
  return `${angle}${x1}${y1}${x2}${y2}${colors}`;
};
