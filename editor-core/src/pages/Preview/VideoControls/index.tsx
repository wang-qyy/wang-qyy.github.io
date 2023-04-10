import { useRef } from 'react';
import { Slider } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import {
  usePreviewHandlerByObserver,
  usePreviewPlayHandlerByObserver,
  useAllTemplateVideoTimeByObserver,
  observer,
} from '@hc/editor-core';

import { formatNumberToTime } from '@/utils/single';
import styles from './index.modules.less';

function VideoControls() {
  const sliderRef = useRef();
  const { currentTime, setCurrentTime } = usePreviewHandlerByObserver();
  const { isPlaying, pauseVideo, playVideo } =
    usePreviewPlayHandlerByObserver();
  const [videoTotalTime] = useAllTemplateVideoTimeByObserver();

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <div className={styles.left}>
          <div className={styles['play-icon']}>
            <XiuIcon
              type={isPlaying ? 'iconzanting' : 'iconbofang'}
              onClick={isPlaying ? pauseVideo : playVideo}
            />
          </div>
          <span>
            {formatNumberToTime(parseInt(`${currentTime / 1000}`, 10))} /{' '}
            {formatNumberToTime(parseInt(`${videoTotalTime / 1000}`, 10))}
          </span>
        </div>
        <div className={styles.right}>
          {/* <div>
            <XiuIcon type="iconshengyin" />
          </div> */}
        </div>
      </div>
      <div>
        <Slider
          ref={sliderRef}
          value={(currentTime / videoTotalTime) * 100}
          style={{ width: '100%' }}
          onChange={value => {
            pauseVideo();
            setCurrentTime(Math.floor(videoTotalTime * (value / 100)));
          }}
          onAfterChange={() => {
            if (sliderRef.current) {
              sliderRef.current.blur();
            }

            // playVideo();
          }}
          tooltipVisible={false}
        />
      </div>
    </div>
  );
}

export default observer(VideoControls);
