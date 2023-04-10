import {
  useMemo,
  useRef,
  useEffect,
  MouseEvent,
  CSSProperties,
  HTMLAttributes,
  useCallback,
  useState,
} from 'react';
import { useSize } from 'ahooks';
import {
  useVideoHandler,
  observer,
  useCurrentTemplate,
  getTemplateIndexById,
  usePlayHandlerByObserver,
  setManualPreview,
} from '@hc/editor-core';
import {
  mouseMoveDistance,
  stopPropagation,
  formatNumberToTime,
} from '@/utils/single';

import TimeRuler from '@/components/TimeLine';

import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';

export const TimeLine = observer(() => {
  const unitWidth = useGetUnitWidth();

  const { currentTime, setCurrentTime } = useVideoHandler();
  const { isPlaying } = usePlayHandlerByObserver();
  const ref = useRef(null);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    stopPropagation(e);
    e.preventDefault();
    // 设置为手动播放
    setManualPreview(true);
    mouseMoveDistance(
      e,
      distance => {
        const changeTime = (distance / unitWidth) * 1000;

        let time = currentTime + changeTime;

        if (time < 0) {
          time = 0;
        }

        setCurrentTime(time);
      },
      () => {
        setManualPreview(false);
      },
    );
  }

  const position = useMemo(() => {
    let left = 0;

    if (currentTime >= 0) {
      left = (currentTime / 1000) * unitWidth;
    }

    return left;
  }, [currentTime, unitWidth]);

  /**
   * @description 播放过程中自动滚动到可视区
   * 与isPlay分开监听，防止与添加片段进入可视区冲突
   * */
  useEffect(() => {
    if (isPlaying) ref.current?.scrollIntoView();
  }, [currentTime]);

  // 播放完后回正 进入可视区
  useEffect(() => {
    if (!isPlaying) ref.current?.scrollIntoView();
  }, [isPlaying]);

  return (
    <div
      ref={ref}
      className="designer-timer-line"
      style={{
        // height: '100%',
        width: 2,
        position: 'absolute',
        left: position,
        top: 0,
        bottom: 0,
        backgroundColor: '#fff',
        zIndex: 10,
        cursor: 'pointer',
        pointerEvents: 'none',
        height: 500,
      }}
      onMouseDown={handleMove}
    >
      <div
        style={{
          width: 6,
          height: 12,
          backgroundColor: '#fff',
          position: 'relative',
          left: -2,
          top: 0,
          borderBottomRightRadius: '50%',
          borderBottomLeftRadius: '50%',
          pointerEvents: 'auto',
        }}
      />
    </div>
  );
});

interface TimeScaleProps extends HTMLAttributes<HTMLDivElement> {
  style?: CSSProperties;
}
/**
 * 时间刻度
 * @param
 * */
export const TimeScale = observer((props: TimeScaleProps) => {
  const { style, ...others } = props;
  const unitWidth = useGetUnitWidth();

  const rulerRef = useRef(null);
  const { width = 0 } = useSize(rulerRef);

  const [scaleTime] = useState(1);

  const [scaleWidth] = useState(); // 刻度间隔

  const [labelInterval] = useState(5); // label 间隔数

  const formatter = useCallback(
    (v: number) => {
      // console.log(v);

      return `${v}s`;
    },
    [scaleTime],
  );

  return (
    <div className="designer-ruler" ref={rulerRef}>
      <TimeLine />
      <TimeRuler.Ruler
        width={width}
        height={25}
        scaleWidth={unitWidth} // 刻度间隔
        labelInterval={labelInterval} // label 间隔数
        formatter={formatter}
        offsetLeft={0}
        scaleHeight={8}
        fontOffsetY={6}
        fontOffsetX={15}
        textBaseline="top"
        fontColor="#484E5F"
        scaleColor="#484E5F"
        textAlign="center"
      />
    </div>
  );
});
