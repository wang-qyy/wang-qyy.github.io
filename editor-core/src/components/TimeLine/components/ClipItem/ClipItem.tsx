import {
  ForwardedRef,
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { AssetType } from '../../store';
import { getNodeFixedPosition, msToSeconds } from '../../utils/common';
import { useMouseHandle } from '../../hooks';
import { ChangeType, Position } from '../../types';

interface IProp {
  width: number;
  time: number;
}

const ClipItemFc = (props: IProp, ref: ForwardedRef<HTMLDivElement>) => {
  const { width, time } = props;
  const [position, _position] = useState<Position | null>(null);
  const children = useRef<HTMLDivElement>(null);

  const setPosition = () => {
    if (!children.current) return;
    const { top, left } = getNodeFixedPosition(children.current);
    _position({ top, left });
  };

  useLayoutEffect(() => {
    setPosition();
  }, []);

  // 拖拽当前元素
  useMouseHandle({
    ele: children,
    onMouseDown: () => {
      setPosition();
    },
    onMouseMove: () => {
      setPosition();
    },
  });

  const timeInfo = msToSeconds(Math.max(time, 0));

  return (
    <div
      className={classNames('timeLine-handler', {
        'timeLine-handler-ghost': width < 30,
      })}
      ref={ref}
    >
      <div
        className="timeLine-handler-icon"
        ref={children}
        onMouseEnter={setPosition}
      >
        <div
          style={{ left: position?.left, top: position?.top }}
          className={classNames('timeLine-handler-tooltip')}
        >
          <div className="timeLine-handler-tooltip-content">
            <div className="timeLine-handler-tooltip-arrow" />
            {timeInfo.m}:{timeInfo.s}.{timeInfo.ms}
          </div>
        </div>
        <span />
        <span />
      </div>
    </div>
  );
};

const ClipItem = forwardRef<HTMLDivElement, IProp>(ClipItemFc);
export default observer(ClipItem);
