import React, { useRef, useMemo, useLayoutEffect, CSSProperties } from 'react';
import { observer } from 'mobx-react';
import type { AssetClass } from '@kernel/typing';
import lottie from 'lottie-web';
import { getLottieSync } from '@kernel/store';

export interface LottiePreviewProps {
  asset: AssetClass;
  onPlayOver: () => void;
  visible: boolean;
}

const PREVIEW_TIMES = 5;

function LottiePreview({ asset, onPlayOver, visible }: LottiePreviewProps) {
  const { rt_url, rt_lottieLoaded } = asset.attribute;
  const { horizontalFlip, verticalFlip } = asset.transform;
  const lottieDom = useRef<HTMLDivElement>(null);
  const lottieStyle = useMemo<CSSProperties>(
    () => ({
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      transform: `scaleX(${horizontalFlip ? -1 : 1}) scaleY(${
        verticalFlip ? -1 : 1
      })`,
    }),
    [horizontalFlip, verticalFlip],
  );

  useLayoutEffect(() => {
    try {
      if (lottieDom.current && rt_lottieLoaded) {
        const lottieIns = lottie.loadAnimation({
          container: lottieDom.current,
          animationData: getLottieSync(rt_url), // Required
          renderer: 'svg',
          loop: PREVIEW_TIMES,
          autoplay: true,
        });
        let times = 1;
        lottieIns.addEventListener('loopComplete', e => {
          if (times >= PREVIEW_TIMES) {
            onPlayOver();
            lottieIns.destroy();
            return;
          }
          times += 1;
        });
      }
    } catch (e: any) {
      console.log(e);
    }
  }, [rt_url, rt_lottieLoaded]);

  useLayoutEffect(() => {
    if (!visible) {
      onPlayOver();
    }
  }, [visible]);
  return (
    <div
      ref={lottieDom}
      className="canvas-lottie-animation"
      style={{
        ...lottieStyle,
        opacity: visible ? 1 : 0,
      }}
    />
  );
}

export default observer(LottiePreview);
