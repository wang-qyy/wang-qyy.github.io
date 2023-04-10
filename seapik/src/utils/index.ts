import { SyntheticEvent } from 'react';
import { Size } from '@/typings';

function getCanvasContainerClientRect() {
  return document.getElementById('canvas_container')!.getBoundingClientRect();
}

/**
 * @description 获取画布缩放比例
 * @param templateSize 模板尺寸
 * @param mainSize 容器尺寸
 * @parma
 * */
export function getScale(
  templateSize: Size,
  containerSize?: Size,
  maxWidthPercent = 0.85,
) {
  const mainSize = containerSize ?? getCanvasContainerClientRect();
  // 根据基础缩放比例计算出实际展示的高
  const height = mainSize.height * maxWidthPercent;

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

// 阻止冒泡
export function stopPropagation(e: SyntheticEvent) {
  e.stopPropagation();
  e.nativeEvent.stopPropagation();
}

export function mouseMoveDistance(
  e: MouseEvent | React.MouseEvent,
  cb: (distanceX: number, distanceY: number) => void,
  finish?: (distanceX: number, distanceY: number) => void,
) {
  const mouseDownPointX = e.clientX;
  const mouseDownPointY = e.clientY;

  const mouseMove = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    cb && cb(currentX - mouseDownPointX, currentY - mouseDownPointY);
  };

  const mouseUp = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    finish && finish(currentX - mouseDownPointX, currentY - mouseDownPointY);
    window.removeEventListener('mouseup', mouseUp);
    window.removeEventListener('mousemove', mouseMove);
  };

  window.addEventListener('mouseup', mouseUp);
  window.addEventListener('mousemove', mouseMove);
}

class WindowBeforeunload {
  open = () => {
    // console.log('WindowBeforeunload');
    window.onbeforeunload = (e) => {
      return '作品还未保存或下载，是否要离开？';
    };
  };

  close = () => {
    window.onbeforeunload = null;
  };
}

export const windowBeforeUnload = new WindowBeforeunload();
