import { Slider, Tooltip } from 'antd';
import { useEffect, useLayoutEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { stopPropagation } from '@/utils/single';
import { XiuIcon } from '@/components';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';

import classNames from 'classnames';

import { ArrowsAltOutlined } from '@ant-design/icons';
import { msToSeconds } from '@/components/TimeLine/utils/common';
import { useDebounceFn } from 'ahooks';
import { clickActionWeblog } from '@/utils/webLog';
import { useCurrentTime } from '../../hooks/timer';
import { autoRatio, maxVal, minVal } from '../../options';
import timeLinePageStore from '../../store';
import { useToolOption } from './hooks';
import styles from './index.less';

const Tools = () => {
  const {
    maxDuration,
    activePartKey,
    durationInfo,
    scaleTime,
    scaleWidth,
    setScaleTime,
    rulerWidth,
    setAutoScale,
    autoScale,
  } = timeLinePageStore;
  const { isPlaying, pauseVideo, playVideo } = useCanvasPlayHandler();
  const [value, _value] = useState(scaleTime);

  const { countDuration } = durationInfo;
  const { currentTime } = useCurrentTime();

  const currentTimeInfo = msToSeconds(Math.max(currentTime, 0));
  const countInfo = msToSeconds(countDuration);

  const toolOption = useToolOption();

  // const autoScale = Math.max(
  //   Math.ceil(maxDuration / ((rulerWidth * autoRatio) / scaleWidth) / 100) *
  //     100,
  //   minVal,
  // );

  const { run, cancel } = useDebounceFn(
    (v: number) => {
      setScaleTime(v);
    },
    {
      wait: 10,
    },
  );

  const onValueChange = (v: number) => {
    run(v);
    _value(v);
    clickActionWeblog('Timeline4​');
  };

  const auto = () => {
    clickActionWeblog('Timeline5​');
    cancel();
    const scale = setAutoScale();
    setScaleTime(scale);
    _value(scale);
  };

  useLayoutEffect(() => {
    auto();
  }, [activePartKey, rulerWidth]);

  useLayoutEffect(() => {
    cancel();
    const scale = setAutoScale();
    _value(scale);
  }, [maxDuration]);

  const clickPlay = () => {
    isPlaying ? pauseVideo() : playVideo();
    clickActionWeblog('Timeline3​');
  };

  const max = autoScale * 2;
  const min = -autoScale;

  return (
    <div className={styles.Tools}>
      <div className={styles.operation}>
        {toolOption.map(opt => {
          if (!opt.show) return null;
          return (
            <div
              key={opt.key}
              className={classNames(styles.tool, {
                [styles.disable]: opt.disable,
                [styles.toolChoosed]: opt.choosed,
              })}
              onClick={e => {
                opt.onclick(e);
                clickActionWeblog(`Timeline_${opt.key}`);
              }}
              onMouseDown={stopPropagation}
            >
              <XiuIcon
                type={opt.icon}
                className={styles.icon}
                style={opt.iconStyles}
              />
              <span
                className={classNames({
                  [styles.hasAfter]: opt.isNew,
                })}
              >
                {opt.text}
              </span>
              {opt.isNew && <div className={styles.hasAfter} />}
            </div>
          );
        })}
      </div>
      <div className={styles.duration}>
        <div className={styles.control} onClick={clickPlay}>
          <XiuIcon
            type={isPlaying ? 'iconzanting' : 'iconbofang'}
            className={styles.icon}
          />
        </div>
        {currentTimeInfo.m}:{currentTimeInfo.s} / {countInfo.m}:{countInfo.s}
      </div>
      <div className={styles.timeLineSize}>
        <span>时间轴调整</span>
        <Slider
          className={styles.slider}
          tooltipVisible={false}
          reverse
          key={autoScale}
          step={(max - min) / 10}
          value={value}
          onChange={onValueChange}
          min={min}
          // max={autoScale * 2}
          max={max}
        />
        <Tooltip title="适应屏幕" getTooltipContainer={ele => ele}>
          <div className="fit-screen" onClick={auto}>
            <ArrowsAltOutlined style={{ transform: 'rotate(45deg)' }} />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default observer(Tools);
