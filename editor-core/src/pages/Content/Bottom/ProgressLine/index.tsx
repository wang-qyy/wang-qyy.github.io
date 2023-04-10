import { CSSProperties, useRef, useEffect, useState } from 'react';
import {
  observer,
  useVideoHandler,
  usePlayHandlerByObserver,
} from '@hc/editor-core';
import { useGetUnitWidth } from '../handler';
import './index.less';

interface ProgressLineProps {
  style?: CSSProperties;
}

export default observer(({ style }: ProgressLineProps) => {
  const unitWidth = useGetUnitWidth();

  const { isPlaying } = usePlayHandlerByObserver();
  const { currentTime } = useVideoHandler();

  const ref = useRef<HTMLDivElement>(null);

  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (isPlaying) ref.current?.scrollIntoView();

    let _left = 0;
    if (unitWidth && currentTime) {
      _left = ~~((currentTime / 1000) * unitWidth);
    }
    setLeft(_left);
  }, [currentTime, unitWidth]);

  // 播放完后回正 进入可视区
  useEffect(() => {
    if (!isPlaying) ref.current?.scrollIntoView();
  }, [isPlaying]);

  return (
    <div
      ref={ref}
      className="bottom-progress-line-wrap"
      style={{
        position: 'absolute',
        transform: `translate(${left}px,0)`,
        ...style,
      }}
    >
      <div className="bottom-progress-line-arrow" />
      <div className="bottom-progress-line-line" />
    </div>
  );
});
