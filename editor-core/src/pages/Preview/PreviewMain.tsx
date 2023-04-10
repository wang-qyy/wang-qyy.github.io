import { useEffect } from 'react';
import { Modal, Button } from 'antd';
import {
  usePreviewPlayHandlerByObserver,
  useTemplateLoadByObserver,
  observer,
} from '@hc/editor-core';
import XiuIcon from '@/components/XiuIcon';
import { useGetDownload } from '@/hooks/useDownload';
import { downloadClickWebLog, recordLastAction } from '@/utils/webLog';
import { useVideoPreviewModal } from '@/store/adapter/useGlobalStatus';

import PreviewVideo from './PreviewVideo';
import ProcessBar from './ProcessBar';

import './index.less';

const PreviewMain = () => {
  // const { open } = useDownloadPopover();
  const { isPlaying, playVideo, pauseVideo } =
    usePreviewPlayHandlerByObserver();
  const { value: visible, close } = useVideoPreviewModal();
  const { loadComplete } = useTemplateLoadByObserver();

  const { open } = useGetDownload('openDownloadModal', () => {
    close();
  });

  useEffect(() => {
    if (visible) {
      playVideo();
      recordLastAction.set({ actionType: 'previewVideo' });
    }
  }, [visible, loadComplete]);

  return (
    <>
      <PreviewVideo className="preview-video-height" />
      <div className="preview-play-wrap">
        <XiuIcon
          className="preview-play-btn"
          type={isPlaying ? 'iconzanting' : 'iconbofang'}
          onClick={isPlaying ? pauseVideo : playVideo}
        />
        <ProcessBar />
      </div>
      <div className="preview-action-btn">
        <Button onClick={close}>继续编辑</Button>
        <Button
          type="primary"
          onClick={() => {
            downloadClickWebLog();
            close();
            open();
          }}
        >
          确认并下载
        </Button>
      </div>
    </>
  );
};

export default observer(PreviewMain);