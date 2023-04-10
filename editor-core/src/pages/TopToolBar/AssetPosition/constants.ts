import React from 'react';

export type Direction = 'LT' | 'T' | 'RT' | 'L' | 'C' | 'R' | 'LB' | 'B' | 'RB';

interface DirectionItem {
  key: Direction;
  iconRotate: number;
  iconType?: string;
  styles: React.CSSProperties;
}

export const options: DirectionItem[] = [
  {
    key: 'LT',
    iconRotate: 225,
    styles: {
      left: 4,
      top: 4,
    },
  },
  {
    key: 'T',
    iconRotate: 270,
    styles: {
      top: 4,
      left: 11,
    },
  },
  {
    key: 'RT',
    iconRotate: 315,
    styles: {
      right: 4,
      top: 4,
    },
  },
  {
    key: 'L',
    iconRotate: 180,
    styles: {
      left: 4,
      top: 7,
    },
  },
  {
    key: 'C',
    iconRotate: 0,
    iconType: 'icontuoyuanxing',
    styles: {
      left: 15,
      top: 11,
      fontSize: 6,
    },
  },
  {
    key: 'R',
    iconRotate: 0,
    styles: {
      right: 4,
      top: 7,
    },
  },
  {
    key: 'LB',
    iconRotate: 135,
    styles: {
      left: 4,
      bottom: 4,
    },
  },
  {
    key: 'B',
    iconRotate: 90,
    styles: {
      bottom: 4,
      left: 11,
    },
  },
  {
    key: 'RB',
    iconRotate: 45,
    styles: {
      right: 4,
      bottom: 4,
    },
  },
];
