import { PlayCircleFilled, PauseCircleFilled } from '@ant-design/icons';
import { Slider } from 'antd';

import {
  useCurrentTemplate,
  useVideoHandler,
  toJS,
  observer,
} from '@hc/editor-core';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';

import { formatNumberToTime } from '@/utils/single';

import styles from './index.less';

const VideoFrame = () => {
  const { setCurrentTime, currentTime } = useVideoHandler();
  const { pauseVideo, playVideo, isPlaying } = useCanvasPlayHandler();

  const { template } = useCurrentTemplate();

  const videoTotalTime = template?.pageAttr.pageInfo.pageTime;

  function toggle() {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  }

  return (
    <div className={styles.warp}>
      <div className={styles.button} onClick={toggle}>
        {isPlaying ? <PauseCircleFilled /> : <PlayCircleFilled />}
      </div>
      <div className={styles.TimeAxis}>
        <Slider
          tooltipVisible={false}
          onChange={time => {
            setCurrentTime(videoTotalTime * (time / 100));
          }}
          value={(currentTime / videoTotalTime) * 100}
        />
      </div>
      <div className={styles.time}>
        {formatNumberToTime(parseInt(`${currentTime / 1000}`, 10))}/
        {formatNumberToTime(parseInt(`${videoTotalTime / 1000}`, 10))}
      </div>
    </div>
  );
};

export default observer(VideoFrame);
