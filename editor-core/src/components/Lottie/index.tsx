import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import './index.less';

interface LottieProps {
  path: string;
  preview?: string;
  autoPlay?: boolean;
  // 是否一直播放
  alwaysPlay?: boolean;
}

const Lottie = (props: PropsWithChildren<LottieProps>) => {
  const { path, preview, autoPlay = false, alwaysPlay = false } = props;
  const lottieNode = useRef(null);
  const animation = useRef<AnimationItem>();

  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (lottieNode?.current && playing) {
      if (!animation.current) {
        animation.current = lottie.loadAnimation({
          container: lottieNode?.current,
          renderer: 'svg',
          loop: true,
          path,
        });
      }
      animation.current?.play();
    } else {
      animation.current?.pause();
    }
  }, [playing]);

  useEffect(() => {
    if (autoPlay) {
      setPlaying(true);
    }
  }, [autoPlay]);

  useEffect(() => {
    return animation.current?.destroy();
  }, []);
  return (
    <div
      className="xiudd-lottie"
      onMouseEnter={() => {
        setPlaying(true);
      }}
      onMouseLeave={() => {
        if (playing && !alwaysPlay) {
          setPlaying(false);
        }
      }}
    >
      {!playing && (
        <img
          src={preview}
          alt="lottie preview"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        />
      )}

      <div
        ref={lottieNode}
        className="xiudd-lottie-box"
        style={{
          opacity: playing ? 1 : 0,
          position: 'absolute',
          left: 0,
          top: 0,
        }}
      />
    </div>
  );
};

export default Lottie;
