import { Slider } from 'antd';
import {
  usePreviewHandlerByObserver,
  useAllTemplateVideoTimeByObserver,
  observer,
  usePlayHandlerByObserver,
} from '@hc/editor-core';

import { formatNumberToTime } from '@/utils/single';

import './index.less';

const ExamProcessBar = () => {
  const { currentTime, setCurrentTime } = usePreviewHandlerByObserver();
  const { isPlaying, pauseVideo, playVideo } = usePlayHandlerByObserver();

  const [videoTotalTime] = useAllTemplateVideoTimeByObserver();
  const setVideoProcess = () => {
    const { value = 0 } = document.getElementById(
      'setVideoProcess',
    ) as HTMLInputElement;
    pauseVideo();
    setCurrentTime(Math.floor(videoTotalTime * (+value / 100)));

    if (isPlaying) {
      setTimeout(() => {
        playVideo();
      }, 0);
    }
  };
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
      <input id="setVideoProcess" />
      <button onClick={setVideoProcess} id="setVideoProcessBtn">
        设置
      </button>
      <div id="videoTotalTimeBox">{currentTime / videoTotalTime}</div>
    </>
  );
};
export default observer(ExamProcessBar);
