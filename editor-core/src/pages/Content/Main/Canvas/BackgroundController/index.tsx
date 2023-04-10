import { MouseEvent, useRef, useMemo, useEffect } from 'react';
import { observer, getRelativeCurrentTime } from '@hc/editor-core';

import { useClickAway } from 'ahooks';

import { useBackgroundSet } from '@/hooks/useBackgroundSet';
import { mouseMoveDistance, stopPropagation } from '@/utils/single';
import { MediaElementHandler } from '@/pages/SidePanel/MusicPanel/handler';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';

import { useBackgroundControl } from '@/store/adapter/useGlobalStatus';

import { useCanvasScale } from '../../CanvasScale/handler';

import './index.less';

export default observer(() => {
  const { isPlaying } = useCanvasPlayHandler();
  const {
    canvasInfo: { scale: canvasScale },
    value: { width: canvasWidth, height: canvasHeight } = {},
  } = useCanvasScale({
    container: document.querySelector('.xiudodo-main') as HTMLElement,
  });

  const { backgroundAsset, updatePosition, backSize, position } =
    useBackgroundSet();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { endCliping } = useBackgroundControl();

  const { attribute } = backgroundAsset || {
    attribute: {
      width: 1,
      height: 1,
      picUrl: '',
      rt_url: '',
      rt_total_time: 0,
    },
  };

  const { picUrl, rt_url, rt_total_time } = attribute;

  const mediaHandler = useRef<MediaElementHandler>(null);

  const size = useMemo(() => {
    let newWidth = 0;
    let newHeight = 0;

    const scale = attribute.width / attribute.height;

    if (canvasWidth > canvasHeight) {
      newWidth = canvasWidth * (backSize / 100);
      newHeight = newWidth / scale;
    } else {
      newHeight = canvasHeight * (backSize / 100);
      newWidth = newHeight * scale;
    }

    return { width: newWidth, height: newHeight };
  }, [backSize]);

  const dh = size.height - canvasHeight;
  const dw = size.width - canvasWidth;

  const positionLimit = useMemo(() => {
    const { left, top } = position;

    return {
      left: {
        min: dw < 0 ? 0 : Math.min(-dw - left, 0),
        max: dw < 0 ? 0 : -Math.min(left, 0), // 向右 正值
      },
      top: {
        min: dh < 0 ? 0 : Math.min(-dh - top, 0),
        max: dh < 0 ? 0 : -Math.min(top, 0), // 向下移动 正值
      },
    };
  }, [position.top, position.left, size.width, size.height]);

  function onCanPlay() {
    if (videoRef.current) {
      // @ts-ignore
      mediaHandler.current = new MediaElementHandler(
        videoRef.current,
        0,
        rt_total_time,
      );

      const time = getRelativeCurrentTime();
      mediaHandler.current.setCurrentTime(time / 1000);
    }
  }

  function onMove(e: MouseEvent<Element>) {
    stopPropagation(e);
    e.preventDefault();

    let tempPosition: any;

    mouseMoveDistance(e, (cx, cy) => {
      cy /= canvasScale;
      cx /= canvasScale;

      let { top, left } = position;
      const {
        left: { max: leftMax, min: leftMin },
        top: { max: topMax, min: topMin },
      } = positionLimit;

      if (cx > leftMax) {
        cx = leftMax;
      } else if (cx < leftMin) {
        cx = leftMin;
      }

      if (cy > topMax) {
        cy = topMax;
      } else if (cy < topMin) {
        cy = topMin;
      }

      top += cy;
      left += cx;
      tempPosition = { left, top };
      updatePosition(tempPosition);
    });
  }

  useEffect(() => {
    if (isPlaying) {
      endCliping();
    }
  }, [isPlaying]);

  useClickAway(() => {
    endCliping();
  }, [document.querySelector('.backgroundController') as HTMLElement]);

  return (
    <div className="backgroundController">
      <div className="backgroundContent">
        <div
          className="backgroundAsset"
          style={{
            ...size,
            transform: `scale(${canvasScale}) translate(${position.left}px,${position.top}px)`,
            // transformOrigin: `${position.left}px ${position.top}px`,
            transformOrigin: '0 0',
          }}
        >
          {backgroundAsset?.meta.type === 'image' ? (
            <img width="100%" src={picUrl} alt="template-background" />
          ) : (
            <video
              ref={videoRef}
              width="100%"
              src={rt_url}
              onCanPlay={onCanPlay}
            />
          )}
        </div>
        <div className="backgroundView" onMouseDown={onMove} />
      </div>
    </div>
  );
});
