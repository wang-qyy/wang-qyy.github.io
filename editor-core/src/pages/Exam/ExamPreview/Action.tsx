import './index.less';
import { observer, usePreviewPlayHandlerByObserver } from '@hc/editor-core';
import { Dropdown, Slider } from 'antd';
import { XiuIcon } from '@/components';
import ProcessBar from '@/pages/Exam/component/ProcessBar/index';

const Action = () => {
  const { volume, isPlaying, playVideo, pauseVideo, setVolume } =
    usePreviewPlayHandlerByObserver();
  //  点击播放按钮
  const onPlay = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };
  return (
    <>
      <div className="exam-preview-action">
        {/* 播放部分 */}
        <XiuIcon
          type={isPlaying ? 'iconzanting' : 'iconbofang'}
          onClick={onPlay}
        />
        <ProcessBar />
        <Dropdown
          placement="topCenter"
          trigger={['click']}
          overlay={
            <div className="exam-preview-action-slider">
              <Slider
                vertical
                defaultValue={volume}
                onChange={setVolume}
                max={100}
              />
            </div>
          }
        >
          <div className="exam-preview-action-volume">
            <XiuIcon type="iconbx_bx-volume-full" />
          </div>
        </Dropdown>
      </div>
    </>
  );
};
export default observer(Action);
