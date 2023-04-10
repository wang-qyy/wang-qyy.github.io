import { MouseEvent, useRef, CSSProperties } from 'react';
import { useSetState } from 'ahooks';
import { Position } from '@kernel/typing';
import { throttle } from 'lodash-es';
import {
  boxSelection,
  boxSelectionEnd,
} from '@kernel/store/assetHandler/adapter/Handler/AssetSelect';
import { getCanvasClientRect } from '@kernel/utils/single';

function getBoundingClientRect(node: HTMLDivElement | null) {
  if (node) {
    const { left, top } = node.getBoundingClientRect();
    return {
      left,
      top,
    };
  }
  return {
    left: 0,
    top: 0,
  };
}

function getPoint(e: MouseEvent<HTMLDivElement>, rect?: Position) {
  const { clientX, clientY } = e;
  if (rect) {
    const { left, top } = rect;
    return {
      left: clientX - left,
      top: clientY - top,
    };
  }
  return {
    left: clientX,
    top: clientY,
  };
}

export function useBoxSelection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useSetState<CSSProperties>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  function onMouseDown(e: MouseEvent<HTMLDivElement>) {
    const rect = getBoundingClientRect(wrapperRef.current);
    const canvasRect = getCanvasClientRect();
    // 由于BoxSelection的位置与画布位置不同，所以框选需要补偿两个div的坐标差值，才能得到真正框选中的元素
    const startPoint = getPoint(e, rect);
    const canvasPoint = getPoint(e, canvasRect);
    const offset = {
      left: canvasPoint.left - startPoint.left,
      top: canvasPoint.top - startPoint.top,
    };
    setStyle({
      ...startPoint,
      width: 0,
      height: 0,
      opacity: 1,
    });
    const move = throttle((e: Event) => {
      // @ts-ignore
      const movePoint = getPoint(e, rect);
      const style = {
        width: Math.abs(movePoint.left - startPoint.left),
        height: Math.abs(movePoint.top - startPoint.top),
        ...startPoint,
      };
      /**
       * 如果选中框的移动位置小于起始位置，需要将起点坐标跟随鼠标移动，模拟出来起始点停滞不同的效果
       */
      if (movePoint.left <= startPoint.left) {
        style.left = startPoint.left - (style.width as number);
      }
      if (movePoint.top <= startPoint.top) {
        style.top = startPoint.top - (style.height as number);
      }
      boxSelection({
        ...style,
        left: style.left + offset.left,
        top: style.top + offset.top,
      });
      setStyle(style);
    }, 25);
    const moveOver = () => {
      setStyle({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        opacity: 0,
      });
      boxSelectionEnd();
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', moveOver);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', moveOver);
  }

  return {
    onMouseDown,
    style,
    wrapperRef,
  };
}
