import classNames from 'classnames';
import {
  useRef,
  useState,
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  SyntheticEvent,
} from 'react';
import './index.less';
import { AutoDestroyVideoHandler } from '@/components/AutoDestroyVideo/handler';

export interface AutoDestroyVideoProps {
  src?: string;
  poster?: string;
  style?: CSSProperties;
  skeletonImageWidth?: number;
  clip?: [number, number];
  defaultBackground?: boolean;
  muted?: boolean;
  loop?: boolean;
  playing?: boolean;

  className?: string;

  styleChild?: CSSProperties;
  styleVideo?: CSSProperties;
}

function AutoDestroyVideo({
  src,
  poster,
  style,
  skeletonImageWidth,
  clip,
  playing,
  defaultBackground = true,
  loop = false,
  muted,
  className = '',
  styleChild,
  styleVideo,
}: AutoDestroyVideoProps) {
  const [playStatus, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const controlMode = useMemo(() => {
    return typeof playing === 'boolean';
  }, [playing]);
  const play = controlMode ? playing : playStatus;

  useEffect(() => {
    if (videoRef.current && !play) {
      videoRef.current?.pause();
    }
  }, [play]);

  useLayoutEffect(() => {
    if (play && videoRef.current) {
      const [currentTime] = clip || [0, 0];
      videoRef.current.currentTime = currentTime / 1000;
    }
  }, [play, clip]);

  function onTimeUpdate() {
    if (!clip) {
      return;
    }
    if (videoRef.current) {
      const videoDom = videoRef.current;
      const [start, end] = clip || [0, 0];
      const { currentTime } = videoRef.current;
      const startTime = start / 1000;
      const endTime = end / 1000;
      if (currentTime > endTime) {
        if (loop) {
          videoDom.currentTime = startTime;
        } else {
          if (!videoDom.paused) {
            videoDom.pause();
            videoDom.currentTime = endTime;
          }
        }
      }
    }
  }

  return (
    <div
      className={classNames('xiudodo-video-wrapper', className, {
        'xiudodo-default-background': defaultBackground,
      })}
      style={style}
      onMouseEnter={() => {
        if (!controlMode) {
          setPlaying(true);
        }
      }}
      onMouseLeave={() => {
        if (!controlMode) {
          setPlaying(false);
        }
      }}
    >
      {src && play && (
        <video
          ref={videoRef}
          src={src}
          loop={loop}
          style={styleVideo}
          muted={muted}
          onTimeUpdate={onTimeUpdate}
          autoPlay
          disablePictureInPicture
        />
      )}

      <div
        style={{
          width: '100%',
          height: '100%',
          background: `url(${poster}) center / contain no-repeat `,
          ...styleChild,
        }}
      />

      {/* {poster ? (
        <img
          src={poster}
          alt="template-video-cover"
          className="xiudodo-video-poster"
        />
      ) : (
        <Skeleton.Image style={{ width: 150 }} />
      )} */}
    </div>
  );
}

export default AutoDestroyVideo;
