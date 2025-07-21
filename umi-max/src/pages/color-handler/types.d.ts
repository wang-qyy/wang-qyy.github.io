export type ColorType =
  | "radial" // 径向渐变
  | "linear"; // 现行渐变

interface ColorStop {
  color: RGBA;
  offset: number; // [0~1]
}
export interface Coords {
  // 线性渐变
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  // 径向渐变
  cx: number;
  cy: number;
  r: number;
  fx: number;
  fy: number;
  fr: number;
}
export interface GradientColor {
  type: ColorType;
  colorStops: ColorStop[];
  coords: Coords;
  gradientUnits: string;
  gradientTransform: number[];
}
