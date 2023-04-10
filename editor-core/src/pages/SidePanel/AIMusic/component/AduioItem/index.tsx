import { MouseEvent, useEffect, useRef, useState } from 'react';
import { XiuIcon } from '@/components';
import { MouseItem } from '@/typings';
import { MediaElementHandler } from '@/pages/SidePanel/MusicPanel/handler';
import { useUpdateEffect } from 'ahooks';

export interface MusicNodeValue {
  id: MouseItem['id'];
  preview: MouseItem['preview'];
  title: MouseItem['title'];
  total_time: MouseItem['total_time'];
  url: MouseItem['url'];
  status: number;
}

export interface AduioItemProps {
  value: MusicNodeValue;
  className?: string;
}

function AduioItem(props: AduioItemProps) {
  const { value } = props;
  const videoRef = useRef(null);
  const [inPlaying, setInPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalTime = Number(value.total_time);
  const mediaHandler = useRef<MediaElementHandler>(null);
  // 播放/暂停
  const handlePlayAudio = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (mediaHandler.current) {
      if (inPlaying) {
        mediaHandler.current.pause();
      } else {
        mediaHandler.current.play(currentTime);
      }
      setInPlaying(!inPlaying);
    }
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
  useEffect(() => {
    if (videoRef.current) {
      if (videoRef.current?.ended) {
        setInPlaying(!inPlaying);
      }
    }
  }, [currentTime]);
  return (
    <div {...props} onClick={handlePlayAudio}>
      <XiuIcon type={inPlaying ? 'iconzanting' : 'iconbofang'} />
      <audio
        ref={videoRef}
        src={value.preview}
        loop={false}
        onCanPlay={onCanPlay}
      >
        糟糕了老铁，你的浏览器不支持audio,请尝试升级
      </audio>
    </div>
  );
}
export default AduioItem;
