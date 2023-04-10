import React, { useMemo } from 'react';

// type ResizePointType = readonly ['left', 'top', 'right', 'bottom', 'leftTop', 'rightTop', 'rightBottom', 'leftBottom'];
export type LRTBType = 'left' | 'top' | 'right' | 'bottom';
export type unLRTBType =
  | 'left_top'
  | 'right_top'
  | 'right_bottom'
  | 'left_bottom';
export type ResizePoint = LRTBType | unLRTBType | 'lock';

export type resizePointType = 'LRTB' | 'unLRTB' | 'whole';
export interface PointNode {
  nodeType: 'LR' | 'TB' | 'unLRTB';
  pointType: ResizePoint;
  cursorKey: number;
  className: string;
}
export interface OnChangeParams {
  width: number;
  height: number;
  rotate?: number;
}

// 静态变量
export module ResizePointStatic {
  export const circleCursorType = [
    'ns-resize',
    'nesw-resize',
    'ew-resize',
    'nwse-resize',
    'pointer',
  ];

  export const pointCursorMap = {
    left: {
      cursor: 'ew-resize',
      key: 2,
    },
    right: {
      cursor: 'ew-resize',
      key: 2,
    },
    top: {
      cursor: 'ns-resize',
      key: 0,
    },
    bottom: {
      cursor: 'ns-resize',
      key: 0,
    },
    left_top: {
      cursor: 'nwse-resize',
      key: 3,
    },
    right_top: {
      cursor: 'nesw-resize',
      key: 1,
    },
    right_bottom: {
      cursor: 'nwse-resize',
      key: 3,
    },
    left_bottom: {
      cursor: 'nesw-resize',
      key: 1,
    },
    lock: {
      cursor: 'pointer',
      key: 4,
    },
  };
  export const LR: ResizePoint[] = ['left', 'right'];
  export const TB: ResizePoint[] = ['top', 'bottom'];
  export const LOCK: ResizePoint[] = ['lock'];
  export const LRTB: ResizePoint[] = [...LR, ...TB];
  export const unLRTB: ResizePoint[] = [
    'left_top',
    'right_top',
    'right_bottom',
    'left_bottom',
  ];
  export const whole: ResizePoint[] = [...LRTB, ...unLRTB];

  export const pointNodeType: PointNode[] = [...LRTB, ...unLRTB, ...LOCK].map(
    item => {
      const cursorKey = pointCursorMap[item].key;
      const node: PointNode = {
        nodeType: 'unLRTB',
        pointType: item,
        cursorKey,
        className: `et_${item}`,
      };
      if (LR.includes(item)) {
        node.nodeType = 'LR';
        return node;
      }
      if (TB.includes(item)) {
        node.nodeType = 'TB';
        return node;
      }
      return node;
    },
  );

  export const resizePointMap: Record<resizePointType, ResizePoint[]> = {
    LRTB,
    unLRTB,
    whole,
  };
}

export interface ElementTransformerProps {
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  scale?: number;
  rotate?: number;
  disabled?: boolean;
  resizePoint?: resizePointType | ResizePoint[];
  onChange: (data: OnChangeParams) => void;
}

export function composeResizeItem(
  disabled?: boolean,
  resizePoint?: ElementTransformerProps['resizePoint'],
): PointNode[] {
  if (disabled) {
    return [];
  }
  const { resizePointMap, pointNodeType } = ResizePointStatic;
  let points: string[] = resizePointMap.whole;

  if (Array.isArray(resizePoint)) {
    points = resizePoint;
  }
  if (typeof resizePoint === 'string') {
    if (resizePointMap[resizePoint]) {
      points = resizePointMap[resizePoint];
    } else {
      console.error(
        new Error(
          `'${resizePoint}' is an invalid value for the 'resizePoint'.`,
        ),
      );
    }
  }
  return pointNodeType.filter(item => points.includes(item.pointType));
}

const angleToCursor = [
  { start: 338, end: 23, cursor: 0 },
  { start: 23, end: 68, cursor: 1 },
  { start: 68, end: 113, cursor: 2 },
  { start: 113, end: 158, cursor: 3 },
  { start: 158, end: 203, cursor: 4 },
  { start: 203, end: 248, cursor: 5 },
  { start: 248, end: 293, cursor: 6 },
  { start: 293, end: 338, cursor: 7 },
];

export function getCursorByRotate(rotate: number) {
  for (let i = 0; i < angleToCursor.length; i++) {
    const item = angleToCursor[i];
    if (rotate < 23 || rotate >= 338) {
      return 0;
    }
    if (rotate >= item.start && rotate < item.end) {
      return item.cursor;
    }
  }
  return 0;
}
