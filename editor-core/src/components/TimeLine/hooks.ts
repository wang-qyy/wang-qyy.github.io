import React, { ReactText, useEffect, useLayoutEffect, useRef } from 'react';
import { TimeLineProps } from './components/Item';
import TimeLineStore from './store';
// import timeLineStore from './store';
import { TimeLineData, TimeLineOpts } from './types';
import { DragItemHandler, DragItemHandlerFC } from './utils/mouseHandler';
import { format2Tracks, isDraggableNode } from './utils/track';

/**
 * 把传进来的格式化为轨道数据
 * @param data
 * @param options
 */
export const useFormatData2Store = (
  data: TimeLineData,
  options: TimeLineOpts,
  timeLineStore: TimeLineStore,
) => {
  useEffect(() => {
    if (!timeLineStore) return;
    if (!data || !data.length) {
      timeLineStore.initTracks([]);
      return;
    }

    const tracks = format2Tracks(data, options, timeLineStore);
    timeLineStore.initTracks(tracks);
    timeLineStore.initOptions(options);
  }, [data, options, timeLineStore]);
};

// 鼠标拖动
export const useMouseHandle = (opts: {
  ele: React.RefObject<HTMLDivElement>;
  onMouseMove?: DragItemHandlerFC;
  onMouseDown?: (e: MouseEvent) => void;
  onMouseUp?: DragItemHandlerFC;
  stopPropagation?: boolean;
}) => {
  const {
    ele,
    onMouseMove = () => {},
    onMouseUp = () => {},
    onMouseDown = () => {},
    stopPropagation,
  } = opts;
  const startPoint = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!ele.current) return;
    const handle = (e: MouseEvent) => {
      stopPropagation && e.stopPropagation();
      startPoint.current = { x: e.pageX, y: e.pageY };
      onMouseDown(e);
      const handler = new DragItemHandler(
        { left: e.pageX, top: e.pageY },
        {
          onMouseMove: info => {
            const { distanceX, distanceY } = info;
            if (!distanceX && !distanceY) return;
            onMouseMove(info);
          },
          onMouseUp,
        },
      );
      handler.onMouseDown();
    };
    ele.current.addEventListener('mousedown', handle);
    return () => {
      ele.current?.removeEventListener('mousedown', handle);
    };
  }, [ele, onMouseDown, onMouseMove, onMouseUp, stopPropagation]);

  // useEventListener(
  //   'mousedown',
  //   (e: MouseEvent) => {
  //     stopPropagation && e.stopPropagation();
  //     startPoint.current = { x: e.pageX, y: e.pageY };
  //     onMouseDown(e);
  //     const handle = new DragItemHandler(
  //       { left: e.pageX, top: e.pageY },
  //       {
  //         onMouseMove: info => {
  //           const { distanceX, distanceY } = info;
  //           if (!distanceX && !distanceY) return;
  //           onMouseMove(info);
  //         },
  //         onMouseUp,
  //       },
  //     );
  //     handle.onMouseDown();
  //   },
  //   {
  //     target: ele,
  //     capture: true,
  //   },
  // );
};

// 取消选中 TODO: 多个时间轴组件时候，会出现取消不掉另一个时间轴上的选中状态的问题
export const useClickDraggable = (timeLineStore: TimeLineStore) => {
  const listenClickDraggable = (e: MouseEvent) => {
    const { clearActiveIds } = timeLineStore;
    const isDraggable = isDraggableNode(e);
    if (!isDraggable) clearActiveIds();
  };

  useLayoutEffect(() => {
    window.addEventListener('click', listenClickDraggable);
    return () => {
      window.removeEventListener('click', listenClickDraggable);
    };
  });
};

export const useSelectedObserver = (
  timeLineStore: TimeLineStore,
  selectKeys?: ReactText[],
) => {
  if (!selectKeys) return;
  const { activeIds, replaceActiveIds } = timeLineStore;
  if (selectKeys.join() !== activeIds.join()) {
    replaceActiveIds(selectKeys);
  }
};

export const useScaleObserver = (
  scale: number,
  timeLineStore: TimeLineStore,
) => {
  useEffect(() => {
    timeLineStore.setScale(scale);
  }, [scale]);
};

export const usePropsObserver = (
  props: TimeLineProps,
  timeLineStore: TimeLineStore,
) => {
  const { scroll, duration, selectKeys } = props;

  // scroll
  const { left, top } = scroll;
  useEffect(() => {
    timeLineStore.setScroll({ left, top });
  }, [left, timeLineStore, top]);

  // 时间轴总时长变动
  useEffect(() => {
    timeLineStore.setDuration(duration);
  }, [duration, timeLineStore]);

  // selectKeys
  if (!selectKeys) return;
  const { activeIds, replaceActiveIds } = timeLineStore;
  if (selectKeys.join() !== activeIds.join()) {
    replaceActiveIds(selectKeys);
  }
};
