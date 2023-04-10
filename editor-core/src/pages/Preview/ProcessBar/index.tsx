import { Slider } from 'antd';
import {
  usePreviewHandlerByObserver,
  usePreviewPlayHandlerByObserver,
  useAllTemplateVideoTimeByObserver,
  observer,
} from '@hc/editor-core';

import { formatNumberToTime } from '@/utils/single';

import './index.less';

const ProcessBar = () => {
  const { currentTime, setCurrentTime } = usePreviewHandlerByObserver();
  const { isPlaying, pauseVideo, playVideo } =
    usePreviewPlayHandlerByObserver();

  const [videoTotalTime] = useAllTemplateVideoTimeByObserver();

  return (
    <>
      <div className="preview-video-process">
        <Slider
          value={(currentTime / videoTotalTime) * 100}
          style={{ width: '100%' }}
          onChange={value => {
            pauseVideo();
            setCurrentTime(Math.floor(videoTotalTime * (value / 100)));

            if (isPlaying) {
              setTimeout(() => {
                playVideo();
              }, 0);
            }
          }}
          // onAfterChange={() => {
          //   playVideo();
          // }}
          tooltipVisible={false}
        />
      </div>

      <div className="preview-video-process-time">
        {formatNumberToTime(parseInt(`${currentTime / 1000}`, 10))}/
        {formatNumberToTime(parseInt(`${videoTotalTime / 1000}`, 10))}
      </div>
    </>
  );
};
export default observer(ProcessBar);
