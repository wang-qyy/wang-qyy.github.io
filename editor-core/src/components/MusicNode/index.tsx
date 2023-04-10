import { MouseEvent, useRef, useState, useEffect, RefObject } from 'react';
import { MediaElementHandler } from '@/pages/SidePanel/MusicPanel/handler';
import { useClickAway } from 'ahooks';
import { MouseItem } from '@/typings';
import { XiuIcon } from '@/components';
import { message, Progress } from 'antd';
import { stopVideo, observer } from '@hc/editor-core';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import styles from './index.module.less';

export interface MusicNodeValue {
  id: MouseItem['id'];
  preview: MouseItem['preview'];
  title: MouseItem['title'];
  total_time: MouseItem['total_time'];
  url: MouseItem['url'];
}

export interface MusicNodeProps {
  onReplace?: (value: MusicNodeValue) => void;
  // 播放时，设置当前Id
  setPlayingId?: (id: string | null) => void;
  // 当前播放的id 如果id不匹配会自动停止播放
  playingId?: string | null;
  volume?: number;
  resId: number | string;
  value: MusicNodeValue;
  clickAwayTarget?: HTMLElement | RefObject<HTMLDivElement>;
}

function MusicNode({
  onReplace,
  resId,
  value,
  clickAwayTarget,
  volume,
  playingId,
  setPlayingId,
}: MusicNodeProps) {
  const audioWrapper = useRef<HTMLDivElement>(null);

  const [loadAudio, setLoadAudio] = useState(false);

  const timeMin = Math.floor(Number(value.total_time) / 1000 / 60);
  const timeSecond = Math.round((Number(value.total_time) / 1000) % 60);
  const [inPlaying, setInPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLAudioElement>(null);
  const mediaHandler = useRef<MediaElementHandler>(null);
  const totalTime = Number(value.total_time);

  const { isPlaying, pauseVideo } = useCanvasPlayHandler();

  // 播放/暂停
  const handlePlayAudio = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (mediaHandler.current) {
      if (inPlaying) {
        mediaHandler.current.pause();
      } else {
        mediaHandler.current.play(currentTime);
        pauseVideo();
      }
      if (setPlayingId && playingId !== value.id) {
        setPlayingId(value.id);
      }
      setInPlaying(!inPlaying);
    }
  };

  function stopPlay() {
    mediaHandler.current?.stop();
    setInPlaying(false);
    setCurrentTime(0);
  }

  useClickAway(() => {
    stopPlay();
  }, clickAwayTarget ?? audioWrapper);

  useEffect(() => {
    if (volume && mediaHandler.current) {
      mediaHandler.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (setPlayingId && playingId !== value.id) {
      stopPlay();
    }
  }, [playingId]);

  useEffect(() => {
    if (currentTime * 1000 >= totalTime) {
      stopPlay();
    }
  }, [currentTime]);

  useEffect(() => {
    if (isPlaying && inPlaying) {
      stopPlay();
    }
  }, [isPlaying]);

  // 获取当前播放进度
  const getAudioCurrentTime = () => {
    return Math.round(((currentTime * 1000) / totalTime) * 100);
  };

  function onCanPlay() {
    if (videoRef.current) {
      // @ts-ignore
      mediaHandler.current = new MediaElementHandler(
        videoRef.current,
        0,
        totalTime,
        setCurrentTime,
      );
    }
  }

  function checkReplace(result: MusicNodeValue) {
    if (onReplace) {
      onReplace(result);
      message.success('替换成功！');
    }
    stopPlay();
    stopVideo();
  }

  return (
    <div
      key={value.id}
      className={styles['music-list-item']}
      ref={audioWrapper}
      onMouseEnter={() => {
        setLoadAudio(true);
      }}
    >
      {loadAudio && (
        <audio
          ref={videoRef}
          src={value.preview}
          loop={false}
          onCanPlay={onCanPlay}
        >
          糟糕了老铁，你的浏览器不支持audio,请尝试升级
        </audio>
      )}

      <div>
        {value.title}.MP3
        {onReplace && (
          <div
            className={styles['action-btn']}
            onClick={() => checkReplace(value)}
          >
            {resId > -1 ? '替换' : '添加'}
          </div>
        )}
      </div>

      <div className={styles['music-play-area']}>
        <div className={styles['play-icon']} onClick={handlePlayAudio}>
          <XiuIcon type={inPlaying ? 'iconzanting' : 'iconbofang'} />
        </div>
        <Progress
          style={{ flex: 1, margin: '0 10px' }}
          strokeColor={{
            '0%': 'red',
            '100%': '#484E5F',
          }}
          showInfo={false}
          percent={getAudioCurrentTime()}
        />

        {/* <Slider
          style={{ flex: 1, margin: '0 10px' }}
          tooltipVisible={false}
          value={getAudioCurrentTime()}
        /> */}
        <div className={styles['music-time']}>{`${
          timeMin < 10 ? `0${timeMin}` : timeMin
        }:${timeSecond < 10 ? `0${timeSecond}` : timeSecond}`}</div>
      </div>
    </div>
  );
}
export default observer(MusicNode);
