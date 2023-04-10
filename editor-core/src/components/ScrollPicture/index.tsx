import { useRef, memo, MouseEvent, PropsWithChildren } from 'react';
import classnames from 'classnames';
import { stopPropagation } from '@/utils/single';

import XiuIcon from '@/components/XiuIcon';

import { useSize, useSetState } from 'ahooks';

import Item from '@/pages/Content/Main/BottomBar/Keyframes/Item';
import './index.less';

interface KeyframeProps {
  data: Array<object>;
  bindClick?: () => void;
}

const Keyframe = ({
  data = [],
  children,
  bindClick,
}: PropsWithChildren<KeyframeProps>) => {
  const listWrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { width: listWrapWidth = 0 } = useSize(listWrapRef);
  const { width: listWidth = 0 } = useSize(listRef);

  const [state, setState] = useSetState({
    isShow: false,
    left: 0,
    position: '',
  });

  const handleScroll = (direction: string, offsetLeft?: number) => {
    const step = listWrapWidth / 2;
    const max = 0;
    const min = -(listWidth - listWrapWidth);

    let left = 0;
    if (offsetLeft && offsetLeft >= 0) {
      left = listWrapWidth / 2 - offsetLeft;
    } else if (direction === 'left') {
      left = state.left + step;
    } else {
      left = state.left - step;
    }

    if (left <= max && left >= min) {
      setState({ left, position: 'center' });
    } else if (left < min) {
      setState({ left: min, position: 'right' });
    } else if (left > max) {
      setState({ left: max, position: 'left' });
    }
  };

  const leftStyle = {
    left: state.left,
  };
  return (
    <div
      className="keyframes-list-wrap"
      ref={listWrapRef}
      onWheel={e => {
        stopPropagation(e);
        if (listWrapWidth < listWidth) {
          handleScroll(e.deltaY > 0 ? 'right' : 'left');
        }
      }}
    >
      <div
        ref={listRef}
        className={classnames({
          list: true,
          center: listWrapWidth > listWidth,
          scroll: listWrapWidth < listWidth,
        })}
        style={listWrapWidth < listWidth ? leftStyle : {}}
      >
        <span>{children}</span>

        {data.map((item: object, index: number) => (
          <Item
            key={`keyframe-img-${index}`}
            data={item}
            bindClick={bindClick}
            handleClick={
              bindClick ||
              ((e: MouseEvent<HTMLDivElement>) => {
                if (listWrapWidth > listWidth) return;
                const { offsetLeft } = (e.target as HTMLElement)
                  .parentNode as HTMLElement;
                handleScroll('', offsetLeft);
              })
            }
          />
        ))}
      </div>

      <div
        hidden={state.position === 'right' || listWrapWidth > listWidth}
        className="arrow arrow-right"
        onClick={() => handleScroll('right')}
      >
        <XiuIcon type="iconarrow_right" />
      </div>
      <div
        hidden={
          listWrapWidth > listWidth ||
          state.position === 'left' ||
          state.left >= 0
        }
        className="arrow arrow-left"
        onClick={() => handleScroll('left')}
      >
        <XiuIcon type="iconarrow_right" />
      </div>
    </div>
  );
};

export default memo(Keyframe);
