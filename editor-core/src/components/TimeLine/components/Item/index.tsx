import { useCreation } from 'ahooks';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { ReactText } from 'react';

import { Template } from '@/pages/TimeLinePage/store';
import TemplateState from '@/kernel/store/assetHandler/template';
import {
  useClickDraggable,
  useFormatData2Store,
  useScaleObserver,
  usePropsObserver,
} from '../../hooks';
// import timeLineStore from '../store';
import { Position, TimeLineData, TimeLineOpts } from '../../types';
import Track from '../Track';
import { TimelineContext } from '../../context';
import TimeLineStore from '../../store';
import './index.less';
import AlignLines from '../AlignLines';
import globalStore from '../../store/globalStore';
import { calcTimeToPx } from '../../utils';

export interface TimeLineProps {
  data: TimeLineData;
  options: TimeLineOpts;
  scroll: Position;
  // width: number; // TODO: 该配置考虑根据maxTime自动计算
  className?: string;
  selectKeys?: ReactText[]; // 选中的元素
  duration: number; // 时间轴总时长，宽度根据时长来计算
  scale: number; // 轨道缩放比例
  style?: React.CSSProperties;
  template?: Template; // 单片段数据
  // autoAdsorb?: boolean;
}

const TimeLine = (props: TimeLineProps) => {
  const {
    data,
    options,
    // width,
    className,
    scale = 1,
    style,
    duration = 0,
  } = props;
  const global = globalStore;
  const { metaScaleWidth, scaleTime, scaleWidth } = global;
  const store = useCreation(() => new TimeLineStore(), []);

  usePropsObserver(props, store);

  useFormatData2Store(data, options, store);

  useScaleObserver(metaScaleWidth * scale, store);

  useClickDraggable(store);

  const { tracks } = store;

  return (
    <TimelineContext.Provider value={store}>
      <div
        className={classNames('timeLine-item-wrapper', className)}
        style={style}
      >
        <AlignLines />
        <div
          className="timeLine-item"
          style={{ width: calcTimeToPx(duration, scaleTime / scaleWidth) }}
        >
          {tracks.map(track => (
            <Track key={track.trackId} track={track} />
          ))}
        </div>
      </div>
    </TimelineContext.Provider>
  );
};

TimeLine.defaultProps = {
  className: undefined,
  selectKeys: undefined,
  style: undefined,
};

export default observer(TimeLine);
