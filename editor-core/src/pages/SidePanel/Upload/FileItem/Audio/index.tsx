import { useRef, useState, useEffect, memo } from 'react';
import { useClickAway } from 'ahooks';
import { Tooltip } from 'antd';
import WaveSurfer from 'wavesurfer.js';

import XiuIcon from '@/components/XiuIcon';
import { stopPropagation } from '@/utils/single';

import './index.less';

function Audio({ src, hiddenAction = false }: any) {
  // source_type参数，1-上传，2-AI文字转语音，3-录音
  const audioWrapper = useRef<HTMLDivElement>(null);

  const audioRef = useRef(null);

  const [waver, setWaver] = useState<WaveSurfer>();
  const [inPlaying, setInPlaying] = useState(false);

  function handlePlay(e?: any) {
    if (e) {
      stopPropagation(e);
    }
    if (inPlaying) {
      waver?.playPause();
    } else {
      setInPlaying(true);
      waver?.play();
    }
  }

  useClickAway(() => {
    if (inPlaying) {
      waver?.stop();
    }
  }, audioWrapper);

  const drawPlay = () => {
    if (!src) return;

    const wavesurfer = WaveSurfer.create({
      container: audioRef.current, // 容器
      waveColor: '#c9c9c9', // 波形图颜色
      progressColor: '#5646ED', // 进度条颜色
      backend: 'MediaElement',
      mediaControls: false,
      // audioRate: '1', // 播放音频的速度
      height: 90,
      // barWidth: 2,
      hideScrollbar: true,
      scrollParent: false,
      interact: false, // 是否在初始化时启用鼠标交互
      cursorColor: 'transparent', // 指示播放头位置的光标填充颜色。
    });

    // 特别提醒：此处需要使用require(相对路径)，否则会报错
    wavesurfer.load(src);

    wavesurfer.on('pause', () => {
      setInPlaying(false);
    });

    wavesurfer.on('audioprocess', num => {
      // const num2 = wavesurfer.getCurrentTime();
    });

    setWaver(wavesurfer);
  };

  useEffect(() => {
    if (audioRef.current) {
      drawPlay();
    }
  }, []);

  return (
    <div style={{ height: '100%' }} ref={audioWrapper}>
      <Tooltip
        title={inPlaying ? '暂停' : '播放'}
        getPopupContainer={() =>
          document.getElementById('xiudodo') as HTMLElement
        }
        overlayClassName="audio-action-play"
      >
        <div
          className="upload-file-item-action upload-file-item-action-play"
          onClick={handlePlay}
          hidden={hiddenAction}
        >
          <XiuIcon type={inPlaying ? 'iconzanting' : 'iconbofang'} />
        </div>
      </Tooltip>

      <div ref={audioRef} />
      <audio src={src} />
    </div>
  );
}

export default memo(Audio);
