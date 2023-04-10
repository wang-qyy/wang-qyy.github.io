import { XiuIcon } from '@/components';
import { WifiOutlined } from '@ant-design/icons';
import { useState, MouseEvent, useRef, useEffect } from 'react';
import { MediaElementHandler } from '@/pages/SidePanel/MusicPanel/handler';
import { stopPropagation } from '@/utils/single';
import { useUpdateEffect, useClickAway } from 'ahooks';

import './index.less';

const AIItem = (props: {
  data: any;
  playingId: number | undefined;
  playing?: boolean;
  className?: string;
  setPlayingId?: (playingId: number) => void;
}) => {
  const aiItemRef = useRef(null);
  const { playing = false, className, data, playingId, setPlayingId } = props;
  const videoRef = useRef(null);
  const [inPlaying, setInPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalTime = Number(data?.total_time);
  const mediaHandler = useRef<MediaElementHandler>(null);
  // 播放/暂停
  const handlePlayAudio = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (data) {
      setPlayingId && setPlayingId(data.id);
      if (mediaHandler.current) {
        if (inPlaying) {
          mediaHandler.current.pause();
        } else {
          mediaHandler.current.play(currentTime);
        }
        setInPlaying(!inPlaying);
      }
    }
  };
  function onCanPlay() {
    if (videoRef.current && !mediaHandler.current) {
      // @ts-ignore
      mediaHandler.current = new MediaElementHandler(
        videoRef.current,
        0,
        totalTime,
        setCurrentTime,
      );
    }
  }

  function stopPlay() {
    mediaHandler.current?.stop();
    setInPlaying(false);
    setCurrentTime(0);
  }

  useClickAway(() => {
    stopPlay();
  }, aiItemRef);

  useEffect(() => {
    if (playingId !== data.id) {
      stopPlay();
    }
  }, [playingId]);

  useEffect(() => {
    if (playing && videoRef.current) {
      // @ts-ignore
      mediaHandler.current = new MediaElementHandler(
        videoRef.current,
        0,
        totalTime,
        setCurrentTime,
      );
      mediaHandler.current.play(currentTime);
      setInPlaying(!inPlaying);
    }
  }, []);
  useUpdateEffect(() => {
    if (currentTime >= totalTime) {
      setCurrentTime(0);
      setInPlaying(false);
      mediaHandler.current?.stop();
    }
  }, [currentTime]);

  return (
    <div
      ref={aiItemRef}
      className={`ai-item ${className}`}
      {...props}
      onClick={stopPropagation}
    >
      <div className="ai-item-icon" onClick={handlePlayAudio}>
        <XiuIcon type={inPlaying ? 'iconzanting' : 'iconbofang'} />
        <audio
          ref={videoRef}
          src={data?.preview || ''}
          loop={false}
          onCanPlay={onCanPlay}
        >
          糟糕了老铁，你的浏览器不支持audio,请尝试升级
        </audio>
      </div>
      <div className={`ai-item-music ${inPlaying ? 'music-playing' : ''}`}>
        <div className="triangle" />
        {data?.id && (
          <>
            <WifiOutlined
              style={{ transform: 'rotate(90deg)', fontSize: 15 }}
            />
            {/* <XiuIcon type="iconbofang" /> */}
            <span style={{ marginLeft: 11 }}>{data.total_time}s</span>
          </>
        )}
      </div>
    </div>
  );
};
export default AIItem;
