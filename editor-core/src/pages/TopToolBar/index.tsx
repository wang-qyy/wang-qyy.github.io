import { useEffect } from 'react';

import { getCurrentAsset, observer } from '@hc/editor-core';

import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import { audioBlur } from '@/store/adapter/useAudioStatus';
import { useVideoVolumeController } from '@/store/adapter/useGlobalStatus';

import { Tools } from './tools';

import './index.less';

const TopToolBar = () => {
  const { isPlaying, pauseVideo } = useCanvasPlayHandler();

  const asset = getCurrentAsset();
  const { close: closeVideoVolumeController } = useVideoVolumeController();

  useEffect(() => {
    if (asset?.meta.id && isPlaying) {
      pauseVideo();
    }
    if (asset) {
      audioBlur();
    }

    if (!asset) {
      closeVideoVolumeController();
    }
  }, [asset]);

  return (
    <>
      {/* <div className="top-tool-bar tool-bar-flex-box"> */}
      <Tools />
      {/* </div> */}
    </>
  );
};

export default observer(TopToolBar);
