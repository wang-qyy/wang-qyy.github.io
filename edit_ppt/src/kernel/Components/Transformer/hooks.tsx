import React, { useState, SyntheticEvent, useRef } from 'react';

import type { ResizePoint } from '@kernel/Components/TransformPoints/handler';
import { ResizePointStatic } from '@kernel/Components/TransformPoints/handler';
import { getCanvasClientRect, stopPropagation } from '@kernel/utils/single';
import { TransformerProps } from '@kernel/Components/Transformer/typing';
import { Coordinate, RectLimit } from '@/kernel';
import { setRotatingStatus } from '@kernel/store';
import { RotateHandler, TransformerHandler } from './mouseHandler';

const { unLRTB } = ResizePointStatic;

// 处理元素旋转
export function useSizeRotate(
  rotate: number,
  style: TransformerProps['style'],
  onChange: TransformerProps['onChange'],
  onChangeEnd?: TransformerProps['onChangeEnd'],
) {
  const [show, setShow] = useState(false);
  const transformRef = useRef<HTMLDivElement>(null);

  function getCenterPoint() {
    if (transformRef.current) {
      const { x, y, width, height } =
        transformRef.current.getBoundingClientRect();
      const centerPointX = x + width / 2 + 4;
      const centerPointY = y + height / 2 + 4;
      return {
        x: centerPointX,
        y: centerPointY,
      };
    }
    return {
      x: 0,
      y: 0,
    };
  }

  function onMouseDown(e: SyntheticEvent) {
    e.stopPropagation();
    setShow(true);
    const handler = new RotateHandler({
      rotate,
      centerPoint: getCenterPoint(),
      onChange: (v) => {
        onChange('rotate', v);
        setRotatingStatus(true);
      },
      onChangeEnd: (v) => {
        setShow(false);
        onChangeEnd?.('rotate', v);
        setRotatingStatus(false);
      },
    });
    handler.mouseDown();
  }

  return {
    showRotate: show,
    onMouseDown,
    transformRef,
  };
}

/**
 *@description 整合asset变形所需要的数据
 */
function useGetTransformNeedData(
  style: TransformerProps['style'],
  rotate: number,
) {
  function getUsefulStyle() {
    function getStyle() {
      const { width = 0, height = 0, top = 0, left = 0 } = style;

      return {
        width,
        height,
        top,
        left,
        rotate,
      };
    }

    return {
      style: { ...style },
      proportion: style.width / style.height,
      getStyle,
    };
  }

  function getCenterPoint() {
    const { left = 0, top = 0, width = 0, height = 0 } = style;
    return {
      x: Number(left) + width / 2,
      y: Number(top) + height / 2,
    };
  }

  return {
    getUsefulStyle,
    getCenterPoint,
  };
}

export interface UseResizeProps {
  rotate: number;
  aspectRatio: boolean;
  style: TransformerProps['style'];
  getRect: () => DOMRect;
  onChange: TransformerProps['onChange'];
  limit: {
    minRect?: RectLimit;
    maxRect?: RectLimit;
  };
  rotateCenter?: Coordinate;
  onChangeEnd?: TransformerProps['onChangeEnd'];
}

// 处理元素尺寸调整
export function useResize({
  rotate,
  style,
  getRect,
  onChange,
  limit,
  onChangeEnd,
  rotateCenter,
  aspectRatio,
}: UseResizeProps) {
  const [resizePontType, setResizePontType] = useState<ResizePoint | ''>('');

  function startResize(pointType: ResizePoint) {
    setResizePontType(pointType);
  }

  function separateAction(event: SyntheticEvent, pointType: ResizePoint) {
    stopPropagation(event);
    startResize(pointType);
    const mouseMove = new TransformerHandler({
      style: { ...style },
      rotate,
      type: pointType,
      getRect,
      rectLimit: limit,
      rotateCenter,
      aspectRatio,
      onChange: (result: TransformerProps['style']) => {
        onChange(pointType, { style: result });
      },
      onChangeEnd: (result: TransformerProps['style']) => {
        onChangeEnd?.(pointType, { style: result });
        setResizePontType('');
      },
    });
    // @ts-ignore
    mouseMove.mouseDown(event as MouseEvent);
  }

  return {
    onResizePointClick: separateAction,
    resizePontType,
  };
}
