import React, {
  CSSProperties,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
  memo,
} from 'react';
import { useSize, useThrottleFn } from 'ahooks';
import WaveSurfer from 'wavesurfer.js';

import { formatNumberToTime } from '@/utils/single';

import './index.less';

interface WavesurferProps {
  height: number;
  src: string;
  style?: CSSProperties;
  waveColor?: string;
  loading?: boolean;
  audioRate?: number;
  playing?: boolean;
  onFinish?: () => void;
  progressColor?: string;
  start?: number;
  end?: number;
}

/**
 *
 * @param height 必传-高度
 * @param src 必传-音频地址
 */
function Wavesurfer({
  height,
  src,
  style,
  waveColor,
  progressColor,
  loading,
  audioRate = 1,
  playing,
  start = 0,
  end,
  onFinish = () => {},
  ...res
}: PropsWithChildren<WavesurferProps>) {
  const [waver, setWaver] = useState<WaveSurfer>();
  // const [playing, setPlaying] = useState(false);
  const [num, setNum] = useState('00:00');
  const [percent, setPercent] = useState(0);
  const el = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const waveSize = useSize(el.current);

  const { run } = useThrottleFn(
    value => {
      setPercent(value);
    },
    { wait: 50 },
  );

  const drawPlay = () => {
    if (!src) return;

    // const test = new WaveSurfer();
    const wavesurfer = WaveSurfer.create({
      container: el.current, // 容器
      waveColor: waveColor ?? '#c9c9c9', // 波形图颜色
      progressColor: progressColor ?? '#c9c9c9', // 进度条颜色
      backend: 'MediaElement',
      mediaControls: false,
      audioRate, // 播放音频的速度
      height,
      barWidth: 1,
      hideScrollbar: true,
      scrollParent: false,
      interact: false, // 是否在初始化时启用鼠标交互
      cursorColor: 'transparent', // 指示播放头位置的光标填充颜色。
    });
    // 特别提醒：此处需要使用require(相对路径)，否则会报错
    wavesurfer.load(src);

    wavesurfer.on('ready', () => {
      setIsLoaded(true);
    });

    // wavesurfer.on('pause', () => {
    //   setPlaying(false);
    // });

    wavesurfer.on('audioprocess', num => {
      // const num2 = wavesurfer.getCurrentTime();
      run((wavesurfer.getCurrentTime() / wavesurfer.getDuration()) * 100);
      const n = formatNumberToTime(parseInt(num));
      if (n !== num) {
        setNum(n);
      }
    });

    wavesurfer.on('pause', () => {
      onFinish();
      wavesurfer.seekTo(0);
    });

    setWaver(wavesurfer);
  };

  useEffect(() => {
    if (el.current && waveSize.width) {
      if (waver) {
        waver.destroy();
        drawPlay();
      } else {
        drawPlay();
      }
    }
    return () => {
      // console.log('unmount');
      // waver.destroy();
    };
  }, [waveSize.width, audioRate]);

  useEffect(() => {
    if (playing) {
      waver?.play(start, end);
      return;
    }

    if (waver?.isPlaying() && isLoaded) {
      waver?.pause();
      waver?.seekTo(0);
    }
  }, [playing, waver, isLoaded]);

  return (
    <>
      {/* <div
        hidden={isLoaded}
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          backgroundColor: '#C0C0C0',
          color: '#fff',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        音频正在加载中…
      </div> */}
      <div ref={el} className="waveform" style={style} {...res} />
      {/* <audio src={src} /> */}
    </>
  );
}

export default memo(Wavesurfer);
