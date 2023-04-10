import { useEventListener } from 'ahooks';
import {
  usePreviewHandlerByObserver,
  usePreviewPlayHandlerByObserver,
} from '@hc/editor-core';

// 审片消息传递
export const useExamListenHook = () => {
  // 向外发送消息
  const sendMessageOutside = (key: string, message: string, data: any) => {
    window.parent.postMessage(
      {
        key,
        remark: message,
        data,
      },
      '*',
    );
  };

  return { sendMessageOutside };
};
// 播放操作
export const useExamHandlerVideo = () => {
  const { sendMessageOutside } = useExamListenHook();
  const { currentTime } = usePreviewHandlerByObserver();
  const {
    volume,
    isPlaying,
    playVideo: play,
    pauseVideo: pause,
    setVolume: set,
  } = usePreviewPlayHandlerByObserver();

  // 播放
  const previewPlay = () => {
    play();
  };
  // 暂停
  const previewPause = () => {
    pause();
    // 向外传递停止信息
    sendMessageOutside('pauseVideo', '暂停播放', {
      currentTime,
      volume,
    });
  };
  // 设置音量
  const previewSetVolume = (vo: number) => {
    set(vo);
  };
  const eventHander = event => {
    const { key, remark, data } = event.data;
    switch (key) {
      case 'playVideo':
        previewPlay();
        break;
      case 'pauseVideo':
        previewPause();
        break;
    }
  };
  useEventListener('message', event => {
    if (event.origin === 'https://movie.xiudodo.com:8000') {
      eventHander(event);
    }
  });
  return {
    isPlaying,
    volume,
    playVideo: previewPlay,
    pauseVideo: previewPause,
    setVolume: previewSetVolume,
  };
};
