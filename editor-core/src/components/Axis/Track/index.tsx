import { useMemo, useRef, SyntheticEvent, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { useSize } from 'ahooks';
import { Tooltip } from 'antd';

import {
  mouseMoveDistance,
  stopPropagation,
  formatNumberToTime,
} from '@/utils/single';

import './index.less';

export interface TrackProps {
  startTime: number;
  endTime: number;
  duration: number;
  onChange: (
    value: {
      startTime: number;
      endTime: number;
      currentTime: number;
      changeTime: number;
    },
    target: string,
  ) => any;
  onFinish?: (params: any) => void;
  overlayClassName?: string;
  durationTooltip?: boolean;
}

export default function Track(props: PropsWithChildren<TrackProps>) {
  const {
    duration,
    onChange,
    children,
    overlayClassName,
    durationTooltip = true,
    onFinish,
  } = props;

  const trackRef = useRef<HTMLDivElement>(null);

  const { width = 0 } = useSize(trackRef);

  const handleMove = (evevt: SyntheticEvent, target: string) => {
    stopPropagation(evevt);
    evevt.preventDefault();
    evevt.nativeEvent.preventDefault();
    // console.log('handleMove', target);
    let extra: any;

    mouseMoveDistance(
      evevt,
      distance => {
        let { startTime, endTime } = props;
        let currentTime = startTime;
        const changeTime = Math.ceil(duration * (distance / width));

        switch (target) {
          case 'start':
            startTime += changeTime;
            currentTime = startTime;
            break;
          case 'end':
            endTime += changeTime;
            currentTime = endTime;
            break;
          default:
            startTime += changeTime;
            endTime += changeTime;
            currentTime = startTime;
        }

        extra = onChange(
          { startTime, endTime, currentTime, changeTime },
          target,
        );
      },
      () => {
        onFinish && onFinish({ target, extra });
      },
    );
  };

  const position = useMemo(() => {
    const start = Math.floor((props.startTime / duration) * 100);
    const end = Math.floor((props.endTime / duration) * 100);

    return { start, end };
  }, [props]);

  const { startTime, endTime } = props;
  const fomatTime = (time: number) => {
    return Number((time / 1000).toFixed(2));
  };

  return (
    <div
      ref={trackRef}
      className={classNames(
        'axis-track-wrap',
        { 'axis-simple': ((position.end - position.start) / 100) * width < 25 },
        overlayClassName,
      )}
    >
      <div className="axis-track-left" style={{ width: `${position.start}%` }}>
        <Tooltip
          title={formatNumberToTime(fomatTime(startTime))}
          getPopupContainer={ele => ele}
        >
          <div
            id="axis-track-left"
            className={classNames(
              'axis-track-handle',
              'axis-track-handle-left',
            )}
            onMouseDown={evevt => handleMove(evevt, 'start')}
          >
            <div className="axis-track-line" />
          </div>
        </Tooltip>
      </div>
      <div
        className="axis-track-center"
        onMouseDown={evevt => handleMove(evevt, 'center')}
        style={{ minWidth: 1, width: `${position.end - position.start}%` }}
      >
        {durationTooltip && (
          <div className="axis-track-duration">
            {formatNumberToTime(fomatTime(endTime - startTime))}
          </div>
        )}

        <div className="axis-track-content">{children}</div>
      </div>

      <div
        className="axis-track-right"
        style={{ width: `${100 - position.end}%` }}
      >
        <Tooltip
          title={formatNumberToTime(fomatTime(endTime))}
          getPopupContainer={ele => ele}
        >
          <div
            className={classNames(
              'axis-track-handle',
              'axis-track-handle-right',
            )}
            onMouseDown={evevt => handleMove(evevt, 'end')}
          >
            <div className="axis-track-line" />
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
