import { useRef, PropsWithChildren, SyntheticEvent } from 'react';
import { useSize } from 'ahooks';
import { flatten, sortBy } from 'lodash-es';
import { usePreviewHandlerByObserver, observer } from '@hc/editor-core';

import {
  formatNumberToTime,
  mouseMoveDistance,
  stopPropagation,
} from '@/utils/single';
import './index.less';

interface SliderRangeProps {
  value: number[][];
  onChange?: (value: number[][]) => void;
  max?: number;
  className?: string;
}

function SliderRange(props: PropsWithChildren<SliderRangeProps>) {
  const { value, onChange, max = 100, className, ...others } = props;
  const { currentTime, setCurrentTime } = usePreviewHandlerByObserver();

  const wrapRef = useRef<HTMLDivElement>(null);
  const { width = 0 } = useSize(wrapRef);

  /**
   * 动态封面设置
   * */
  function handleRangeChange(
    change: number[],
    changeValue: number[] | number,
    index: number,
  ) {
    const temp = value ? [...value] : [];
    temp[index ?? temp.length] = change;

    const newValue = [];

    const tempValue = flatten(sortBy(temp, o => o[0]));

    for (let i = 0; i < tempValue.length; ) {
      const start = tempValue[i];
      const end = tempValue[i + 1];
      const nextStart = tempValue[i + 2];

      if (end >= nextStart) {
        newValue.push([start, tempValue[i + 3]]);
        i += 4;
      } else {
        newValue.push([start, tempValue[i + 1]]);
        i += 2;
      }
    }

    let totalDuration = 0;
    newValue.forEach(item => {
      const [start, end] = item;
      totalDuration += end - start;
    });

    // 动态封面最多设置3s
    if (totalDuration > 3000) return;

    onChange && onChange(newValue);

    setCurrentTime(changeValue[0] ?? changeValue);
  }

  function handleMove(e: SyntheticEvent, index: number, target: number) {
    stopPropagation(e);
    e.preventDefault();
    mouseMoveDistance(
      e,
      distance => {
        let temp = [...value[index]];
        const change = Math.ceil((distance / width) * max);
        let targetValue = temp[target];

        if (target >= 0) {
          targetValue += change;

          temp[target] = targetValue;
        } else {
          temp = [temp[0] + change, temp[1] + change];
        }

        const [start, end] = temp;

        if (end - start < 100 || end > max || start < 0) return;

        handleRangeChange(temp, targetValue ?? temp, index);
      },
      () => {},
    );
  }

  function position(item: number[]) {
    const [start, end] = item;
    const left = (start / max) * 100;
    const right = (end / max) * 100;
    return {
      left,
      right,
      width: right - left,
    };
  }

  return (
    <div
      ref={wrapRef}
      className={`xdd-designer-slider-range ${className}`}
      onMouseDown={e => {
        const { x } = wrapRef.current?.getBoundingClientRect();
        const { clientX } = e;
        const clickPosition = clientX - x;
        let start = Math.ceil((clickPosition / width) * max);
        let end = start + 500;

        if (end > max) {
          end = max;
          start = end - 500;
        }

        handleRangeChange([start, end], start, value?.length ?? 0);
      }}
      {...others}
    >
      <div className="slider-rail" />
      {Array.isArray(value) &&
        value.map((item, index) => {
          const { left, right, width } = position(item);

          return [
            <div
              key={`handler-left-${index}`}
              className="slider-handler"
              style={{ left: `${left}%` }}
              onMouseDown={e => handleMove(e, index, 0)}
            />,
            <div
              key={`slider-track-${index}`}
              className={`slider-track slider-track-${index}`}
              style={{ left: `${left}%`, width: `${width}%`, cursor: 'move' }}
              onMouseDown={e => {
                handleMove(e, index, -1);
              }}
            />,
            <div
              key={`mark-${index}`}
              className="slider-mark"
              style={{
                left: `${left + width / 2}%`,
              }}
              onMouseDown={stopPropagation}
            >
              <span className="duation">
                {`${formatNumberToTime(
                  Number(`${((item[1] - item[0]) / 1000).toFixed(2)}`),
                )}s`}
              </span>
              <span
                className="action"
                onClick={() => {
                  value.splice(index, 1);
                  onChange && onChange([...value]);
                }}
              >
                取消封面
              </span>
            </div>,
            <div
              key={`handler-right-${index}`}
              className="slider-handler"
              style={{ left: `${right}%` }}
              onMouseDown={e => handleMove(e, index, 1)}
            />,
          ];
        })}
      <div
        className="slider-step"
        onMouseDown={e => {
          // stopPropagation(e);
          e.preventDefault();
          mouseMoveDistance(e, distance => {
            const change = (distance / width) * max;
            setCurrentTime(Math.max(0, change + currentTime));
          });
        }}
        style={{
          left: `${(currentTime / max) * 100}%`,
          transform: 'translate(-50%)',
        }}
      />
    </div>
  );
}
export default observer(SliderRange);
