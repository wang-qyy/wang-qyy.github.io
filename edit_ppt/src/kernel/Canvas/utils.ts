import { config } from '@kernel/utils/config';
import { useKeyPress } from 'ahooks';
import { CanvasInfo, TransformPosition } from '@kernel/typing';
import { useEffect, useMemo, useRef } from 'react';
import { updateCurrentAssetPositionWhenKeyPress } from '@kernel/storeAPI';

export function getVideoCurrentTime() {}

// requestAnimationFrame 兼容模式
export const rAfCallBack = (() => {
  if (window.requestAnimationFrame) {
    return window.requestAnimationFrame;
  }
  return (cb: () => void) => window.setTimeout(cb, config.frameRat);
})();

export function getCanvasNode() {
  return document.getElementById('HC-CORE-EDITOR-CANVAS');
}

/**
 * @description 键盘箭头操作
 */
export const useArrowHandler = () => {
  useKeyPress('ArrowUp', (e) => {
    e.stopPropagation();
    updateCurrentAssetPositionWhenKeyPress(({ posY }: TransformPosition) => {
      if (e.shiftKey) {
        return {
          posY: posY - 50,
        };
      }
      return {
        posY: posY - 2,
      };
    });
  });
  useKeyPress('ArrowDown', (e) => {
    e.stopPropagation();
    updateCurrentAssetPositionWhenKeyPress(({ posY }: TransformPosition) => {
      if (e.shiftKey) {
        return {
          posY: posY + 50,
        };
      }
      return {
        posY: posY + 2,
      };
    });
  });
  useKeyPress('ArrowLeft', (e) => {
    e.stopPropagation();
    updateCurrentAssetPositionWhenKeyPress(({ posX }: TransformPosition) => {
      if (e.shiftKey) {
        return {
          posX: posX - 50,
        };
      }
      return {
        posX: posX - 2,
      };
    });
  });
  useKeyPress('ArrowRight', (e) => {
    e.stopPropagation();
    updateCurrentAssetPositionWhenKeyPress(({ posX }: TransformPosition) => {
      if (e.shiftKey) {
        return {
          posX: posX + 50,
        };
      }
      return {
        posX: posX + 2,
      };
    });
  });
};
const getOffset = (obj: any) => {
  let { offsetLeft, offsetTop } = obj;
  if (obj.offsetParent != null) {
    const offset = getOffset(obj.offsetParent);
    offsetLeft += offset.offsetLeft;
    offsetTop += offset.offsetTop;
  }
  return { offsetLeft, offsetTop };
};
/**
 * 监听鼠标移动信息
 */
export const useMouseHandler = () => {
  const position = useRef({ left: 0, top: 0 });

  function MousePositionCanvas() {
    const canvasNode = document.getElementById(
      'HC-CORE-EDITOR-CANVAS',
    ) as HTMLDivElement;
    const { offsetLeft, offsetTop } = getOffset(canvasNode);
    // todo 暂时去除
    // global.setStatus({
    //   mousePosition: {
    //     left: position.current?.left - offsetLeft,
    //     top: position.current?.top - offsetTop,
    //   },
    // });
  }

  useEffect(() => {
    document.addEventListener('dragend', (e) => {
      MousePositionCanvas();
    });
    document.addEventListener('drag', (e) => {
      // @ts-ignore
      position.current = { left: e.clientX, top: e.clientY };
      MousePositionCanvas();
    });
  }, []);
};

export function useCanvasStyle(canvasInfo: CanvasInfo) {
  const { width, height, scale } = canvasInfo;
  return useMemo(() => {
    const canvasStyle = {
      width: width * scale,
      height: height * scale,
    };
    const renderStyle = {
      width,
      height,
      transform: `translateZ(0) scale(${scale})`,
      transformOrigin: '0 0',
    };
    return {
      canvasStyle,
      renderStyle,
    };
  }, [width, height, scale]);
}
