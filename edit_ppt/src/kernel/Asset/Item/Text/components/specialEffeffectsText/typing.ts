import { CSSProperties } from 'react';
import { TransformPosition, SignatureEffect } from '@kernel/typing';

export interface fontAttrProperties extends CSSProperties {
  charSpacing?: number;
  text?: String;
}
export interface EffectAuto extends SignatureEffect {
  source?: string[];
  textDecoration?: string;
  linethrough?: boolean;
  underline?: boolean;
  fontWeight: string;
  fontStyle: string;
  fontFamily: string;
  fontSize: number;
  oldFontSize: number;
  width: number;
  height: number;
  strokeUniform: boolean;
}
