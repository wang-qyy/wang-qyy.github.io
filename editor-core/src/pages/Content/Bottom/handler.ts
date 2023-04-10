import { MouseEvent, useEffect, useMemo } from 'react';
import { useSize } from 'ahooks';
import { getAllTemplateVideoTime } from '@hc/editor-core';
import {
  useTimeAxisScale,
  useTimelineMode,
  updateTimeAxisScale,
} from '@/store/adapter/useGlobalStatus';
import { useSetTimeScale } from '@/store/adapter/useDesigner';
import getUrlParams from '@/utils/urlProps';
import { formatNumberToTime } from '@/utils/single';
import timeLinePageStore from '@/pages/TimeLinePage/store';

export const unitWidth = 10; // 1s的长度为10px

const { redirect } = getUrlParams();

export function getUnitWidth(scale: number) {
  return unitWidth * scale;
}

/**
 * @description 获取时间轴单位长度
 */
export function useGetUnitWidth() {
  const { value } = useTimeAxisScale();
  const { timeRuleScale } = useSetTimeScale();
  const { timeLinePartKey } = useTimelineMode();

  if (timeLinePartKey) {
    const { scaleTime, scaleWidth } = timeLinePageStore;
    return (1000 / scaleTime) * scaleWidth;
  }

  if (redirect === 'designer') {
    return unitWidth * timeRuleScale;
  }

  return unitWidth * (value / 10);
}

interface ScrollResult {
  distanceX: number;
  distanceY: number;
  justifyContent?: 'start' | 'end';
  fixedWidth: boolean;
}
/**
 * @description 片段裁剪滚动处理
 */
export function handleScroll({
  e,
  target,
  targetScroll,
  moving,
  finish,
}: {
  e: MouseEvent<HTMLElement>;
  target: 'start' | 'end';
  targetScroll: HTMLElement;
  moving: (result: ScrollResult) => void;
  finish?: (result: ScrollResult) => void;
}) {
  const mouseDownPointX = e.clientX;
  const mouseDownPointY = e.clientY;
  let distanceX = 0;
  let distanceY = 0;
  let incrementWidth = 0;

  let timer = {};

  function autoScroll(params: {
    increment: number;
    justifyContent: 'end' | 'start';
    fixedWidth: boolean;
    needScroll: boolean;
  }) {
    clearTimeout(timer.current);
    const { increment, needScroll, ...others } = params;

    timer = {
      current: setTimeout(() => {
        incrementWidth += increment;
        moving({
          distanceX: incrementWidth,
          distanceY,
          ...others,
        });

        autoScroll(params);

        if (needScroll) {
          targetScroll.scrollBy(increment, 0);
        }
      }, 10),
    };
  }

  function scrollInfo() {
    return {
      left: 100,
      right: document.body.clientWidth,
    };
  }
  let isAutoScroll = false;
  let prevCurrentY = 0;
  const mouseMove = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    const newDistanceX = currentX - mouseDownPointX;
    const newDistanceY = currentY - mouseDownPointY;
    const { left, right } = scrollInfo();

    if (currentX <= left && target === 'end') {
      if (!isAutoScroll) {
        autoScroll({
          increment: 5,
          justifyContent: 'start',
          fixedWidth: false,
          needScroll: false,
        });
        incrementWidth = newDistanceX;
        prevCurrentY = newDistanceX;
        isAutoScroll = true;
      }
    } else if (currentX >= right - 50) {
      if (!isAutoScroll) {
        autoScroll({
          increment: target === 'start' ? 5 : 5,
          justifyContent: target === 'start' ? 'end' : 'start',
          fixedWidth: newDistanceX < 0 && target === 'end',
          needScroll: target !== 'start',
        });
        incrementWidth = newDistanceX;
        prevCurrentY = newDistanceX;
        isAutoScroll = true;
      }
    } else {
      clearTimeout(timer.current);
      moving({
        distanceX: incrementWidth + (newDistanceX - prevCurrentY),
        distanceY,
        justifyContent: target === 'start' ? 'end' : 'start',
        fixedWidth:
          target === 'start' || (target === 'end' && newDistanceX < 0),
      });

      isAutoScroll = false;
    }

    distanceX = newDistanceX;
    distanceY = newDistanceY;
  };

  const mouseUp = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    distanceX = currentX - mouseDownPointX;
    distanceY = currentY - mouseDownPointY;

    finish && finish({ distanceX, distanceY });
    window.removeEventListener('mouseup', mouseUp);
    window.removeEventListener('mousemove', mouseMove);

    clearTimeout(timer.current);
  };

  window.addEventListener('mouseup', mouseUp);
  window.addEventListener('mousemove', mouseMove);

  //   targetScroll.scrollTo(scrollLeft, scrollTop);
}

export function formatTime(time: number) {
  if (time < 60000) {
    return `${(time / 1000).toFixed(1)}秒`;
  }
  return formatNumberToTime(parseInt(`${time / 1000}`, 10));
}

/**
 * @description 计算时间轴适应屏幕 的缩放值
 * */
export function handleTimeAxisFitScreen() {
  const allTemplateVideoTime = getAllTemplateVideoTime();
  const container = document.querySelector('.xiudodo-bottom');

  const containerWidth = container?.clientWidth ?? 0;

  // 170 为添加按钮的宽度
  const scale =
    (containerWidth - 170) / unitWidth / (allTemplateVideoTime / 1000);

  updateTimeAxisScale(Math.max(scale * 10, 5));
}

export function useTimeAxisScaleRange() {
  const allTemplateVideoTime = getAllTemplateVideoTime();

  const container = document.querySelector('.xiudodo-bottom') as HTMLElement;

  const { width = 0 } = useSize(container);

  const autoFit = useMemo(() => {
    // 170 为添加按钮的宽度
    const scale = (width - 170) / unitWidth / (allTemplateVideoTime / 1000);

    return Math.max(scale * 10, 5);
  }, [width, allTemplateVideoTime]);

  return {
    min: 5,
    max: autoFit * 2,
    fit: autoFit,
  };
}
