import './index.less';
import { observer, usePreviewPlayHandlerByObserver } from '@hc/editor-core';
import { XiuIcon } from '@/components';
import ProcessBar from '@/pages/Exam/component/ProcessBar/index';
import Action from './Action';
import ExamPreviewVideo from '../component/ExamPreviewVideo';

const ExamPreview = (props: { onContrls: boolean }) => {
  const { onContrls } = props;
  const { isPlaying, playVideo, pauseVideo } =
    usePreviewPlayHandlerByObserver();
  //  点击视频
  const onPlay = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };
  return (
    <>
      <div className="xiudodo-exam-preview">
        {/* 播放图标 */}
        {!isPlaying && (
          <div className="exam-preview-video-status" onClick={playVideo}>
            <XiuIcon type="iconbofang" />
          </div>
        )}
        <div className="exam-preview-video" onClick={onPlay}>
          <ExamPreviewVideo />
        </div>
        {onContrls && <Action />}
        <div className="preview-play-wrap" style={{ display: 'none' }}>
          <XiuIcon
            className="preview-play"
            type="iconbofang"
            onClick={playVideo}
          />
          <ProcessBar />
          <XiuIcon
            className="preview-pause"
            type="iconzanting"
            onClick={pauseVideo}
          />
          {/* <ProcessBar /> */}
        </div>
      </div>
    </>
  );
};
export default observer(ExamPreview);
