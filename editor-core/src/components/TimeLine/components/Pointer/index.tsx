import classNames from 'classnames';
import { clamp } from 'lodash-es';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';

import { useMouseHandle } from '../../hooks';
import globalStore from '../../store/globalStore';
import { calcTimeToPx, calcPxToTime } from '../../utils';
import { getNodeFixedPosition } from '../../utils/common';
import './index.less';
import { setManualPreview } from '@/kernel';

interface IProps {
  currentTime: number;
  scrollLeft: number;
  maxDuration: number; // 最大时长限制
  hidden?: boolean;
  onTimeChange?: (time: number, changeType: 'click' | 'move') => void;
}

const Pointer = (props: IProps) => {
  const {
    currentTime,
    scrollLeft,
    onTimeChange = () => {},
    maxDuration,
    hidden,
  } = props;
  const { metaScaleWidth, paddingLeft, timeLineWrapper } = globalStore;
  const [moving, _moving] = useState(false);
  const handlerRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<HTMLDivElement>(null);

  const left =
    calcTimeToPx(currentTime, metaScaleWidth) + paddingLeft - scrollLeft;
  // 判断是否超出最小最大限制
  const checkTimeChange = useCallback(
    (time: number, type: 'click' | 'move') => {
      const newTime = clamp(time, 0, maxDuration);
      if (newTime === currentTime) return;
      onTimeChange(newTime, type);
    },
    [currentTime, maxDuration],
  );

  // 点击改变时间
  const clickHandler = useCallback(
    (e: MouseEvent) => {
      if (!handlerRef.current) return;
      const { left: offsetLeft } = getNodeFixedPosition(handlerRef.current);
      const time = calcPxToTime(
        e.pageX - offsetLeft + scrollLeft,
        metaScaleWidth,
      );
      checkTimeChange(time, 'click');
    },
    [scrollLeft, metaScaleWidth, checkTimeChange],
  );

  useLayoutEffect(() => {
    timeLineWrapper?.addEventListener('click', clickHandler);
    return () => {
      timeLineWrapper?.removeEventListener('click', clickHandler);
    };
  }, [timeLineWrapper, clickHandler]);

  // 拖动手柄
  useMouseHandle({
    ele: moveRef,
    // stopPropagation: true,
    onMouseDown: () => {
      _moving(true);
      setManualPreview(true);
    },
    onMouseMove: position => {
      const movedTime =
        currentTime + calcPxToTime(position.distanceX, metaScaleWidth);
      checkTimeChange(movedTime, 'move');
    },
    onMouseUp: () => {
      _moving(false);
      setManualPreview(false);
    },
  });

  return (
    <div className="pointer-wrapper">
      <div
        className="pointer-handler"
        style={{ left: paddingLeft }}
        // onClick={clickHandler}
        ref={handlerRef}
      />
      <div
        className={classNames('pointer-content', {
          'pointer-content-hidden': hidden,
        })}
        style={{ left }}
      >
        <div
          className={classNames('pointer-arrow', {
            'pointer-arrow-moving': moving,
          })}
          ref={moveRef}
        />
        <div className="pointer-line" />
      </div>
    </div>
  );
};

Pointer.defaultProps = {
  onTimeChange: () => {},
  hidden: false,
};

export default observer(Pointer);
