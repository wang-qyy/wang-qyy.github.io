export type Refs = Record<string, HTMLSpanElement | null>;

export interface TextPosition {
  left: number;
  top: number;
  width: number;
  height: number;
}
export type TextPositionObject = Record<string, TextPosition>;
