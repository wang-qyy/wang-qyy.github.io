import { useMemo, RefObject } from 'react';
import { useSize } from 'ahooks';
import {
  useUpdateCanvasInfo,
  useCanvasScale as useUpdateCanvasScale,
  getCanvasInfo,
  updateCanvasScale,
} from '@/store/adapter/useTemplateInfo';
import { setManualScale } from '@/store/adapter/useGlobalStatus';

export interface SizeType {
  width: number;
  height: number;
}

/**
 * @description 获取画布缩放比例
 * @param templateSize 模板尺寸
 * @param mainSize 容器尺寸
 * @parma
 * */
export function getScale(
  templateSize: SizeType,
  mainSize: SizeType,
  maxWidthPercent = 0.9,
  scaleBase = 60,
) {
  // 缩放比例基数
  // scaleBase = templateSize.width < templateSize.height ? 20 : 50;
  // const scaleBase = 130;

  // 根据基础缩放比例计算出实际展示的高
  const height = mainSize.height - scaleBase;
  // 根据实际高度计算出缩放比值
  let scale = height / templateSize.height;
  // 如果此缩放值下的宽度大于宽度限制
  const width = templateSize.width * scale;
  // 则比例以当前视口下的最大宽度为准
  const maxWidth = mainSize.width * maxWidthPercent;
  if (width > maxWidth) {
    scale = maxWidth / templateSize.width;
  }

  if (scale < 0.1) {
    // 导航器相对缩放较小
    return Number(scale.toFixed(2));
  }
  return Number(scale.toFixed(1));
}

const minScale = 0.2;

// 初始化画布缩放
export function initCanvasScale(container?: HTMLElement) {
  const canvasSize = getCanvasInfo();

  if (container) {
    const { width, height } = container.getBoundingClientRect();
    const scale = getScale(canvasSize, { width, height });

    updateCanvasScale(Math.max(scale, minScale));
  }
}

export function useCanvasScale({
  container,
}: {
  container: HTMLElement | RefObject<HTMLElement>;
}) {
  const { value } = useUpdateCanvasInfo();

  const { value: scale } = useUpdateCanvasScale();

  const size = useSize(container);

  const canvasInfo = useMemo(() => {
    return {
      scale,
      width: value.width * scale,
      height: value.height * scale,
    };
  }, [scale, value.height, value.width]);

  const isScroll = useMemo(() => {
    let isScrollX = false;
    let isScrollY = false;
    if (canvasInfo.height > Number(size.height)) {
      isScrollY = true;
    }
    if (canvasInfo.width > Number(size.width)) {
      isScrollX = true;
    }

    return { isScrollX, isScrollY };
  }, [canvasInfo, size]);

  // 更新
  function update(params: number | 'fit') {
    if (params === 'fit') {
      // const s = getScale(value, size);

      initCanvasScale(container);
      // updateCanvasScale(fitScreenCanvas);
    } else {
      if (params < minScale) {
        params = minScale;
      } else if (params > 3) {
        params = 3;
      }
      updateCanvasScale(params);
      setManualScale(true);
    }
  }

  return {
    update,
    canvasInfo,
    newCanvasInfo: {
      width: value.width,
      height: value.height,
      scale,
    },
    isScroll,
    value,
    scale,
    templateSize: value,
  };
}
