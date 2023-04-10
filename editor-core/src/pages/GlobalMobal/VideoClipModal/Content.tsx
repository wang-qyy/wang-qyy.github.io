import {
  useState,
  useRef,
  useMemo,
  useEffect,
  MouseEvent,
  PropsWithChildren,
} from 'react';
import { Button, message } from 'antd';
import { useSetState } from 'ahooks';
import {
  useCurrentTemplate,
  useAllTemplateVideoTimeByObserver,
  getRelativeCurrentTime,
} from '@hc/editor-core';

import { templateTotalDurationLimit } from '@/config/basicVariable';
import { MediaElementHandler } from '@/pages/SidePanel/MusicPanel/handler';

import Rail from '@/components/Axis/Rail';
import { XiuIcon } from '@/components';
import Track from '@/components/Axis/Track';
import { formatNumberToTime, stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';

import { ItemClickType } from '../../SidePanel/BackgroundElement/index';
import './index.less';

export interface ClipModalContentProps {
  onCancel?: (e: MouseEvent<HTMLElement>) => void;
  onOk?: (cut: { cst: number; cet: number }) => void;
  data: {
    duration: number;
    preview_video: string;
    height: number;
    width: number;
    cst?: number;
    cet?: number;
  };
  actionType: ItemClickType;
  trigger: string; // 触发的位置
}

export default function ClipModalContent(
  props: PropsWithChildren<ClipModalContentProps>,
) {
  const { onCancel, onOk, data, actionType, trigger } = props;
  const mediaHandler = useRef<MediaElementHandler>(null);
  const [state, setState] = useSetState({
    isPlaying: false,
  });
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [clip, setClip] = useState({ cst: 0, cet: 0 });

  // 是否有裁剪行为
  const [hasClip, setHasClip] = useState(false);

  const { template } = useCurrentTemplate();
  const [allTempTime] = useAllTemplateVideoTimeByObserver();

  // 播放/暂停
  const handlePlayAudio = (e: MouseEvent<HTMLDivElement>) => {
    stopPropagation(e);
    if (mediaHandler.current) {
      if (state.isPlaying) {
        mediaHandler.current.pause();
      } else {
        mediaHandler.current.play(currentTime / 1000);
      }

      setState({ isPlaying: !state.isPlaying });
    }
  };

  function onCanPlay() {
    if (videoRef.current) {
      // @ts-ignore
      mediaHandler.current = new MediaElementHandler(
        videoRef.current,
        clip.cst,
        Number(data.duration),
        time => setCurrentTime(time * 1000),
      );
    }
  }

  function handleSetCurrentTime(time: number) {
    setCurrentTime(time);
    mediaHandler.current?.setTime(time / 1000);
  }

  useEffect(() => {
    if (
      (currentTime >= clip.cet && state.isPlaying) ||
      currentTime >= Number(data.duration)
    ) {
      handleSetCurrentTime(clip.cst);
    }
  }, [currentTime]);

  const maxDuration = useMemo(() => {
    let compare = 0;

    switch (actionType) {
      case 'add':
        compare = templateTotalDurationLimit - allTempTime;
        break;

      case 'replace':
      case 'addInCurrent':
        compare =
          templateTotalDurationLimit -
          allTempTime +
          template.videoInfo.allAnimationTime;
        break;
      case 'addAsset':
        compare =
          template.videoInfo.allAnimationTime -
          getRelativeCurrentTime() +
          (templateTotalDurationLimit - allTempTime);
        break;
      case 'cut':
        return data.duration;
    }

    return Math.min(compare, data.duration);
  }, [actionType]);

  useEffect(() => {
    let cst = 0;
    let cet = 0;
    switch (actionType) {
      case 'add':
        cet = Math.min(Number(data.duration), 5000, maxDuration);
        break;
      case 'replace':
      case 'addAsset':
      case 'addInCurrent':
        cet = Math.min(Number(data.duration), maxDuration);
        break;
      case 'cut':
        if (Number(data.cst) >= 0 && data.cet) {
          cst = data.cst;
          cet = data.cet;
        } else {
          cet = data.duration;
        }
        break;
    }

    setClip({ cst, cet });
  }, [template?.id]);

  const limit = useMemo(() => {
    const { cst, cet } = clip;
    return {
      start: {
        min: -(maxDuration - (cet - cst)),
        max: cet - 1000 - cst,
      },
      end: {
        min: -(cet - 1000 - cst),
        max: Number(maxDuration) - (cet - cst),
      },
      center: { min: -cst, max: Number(data.duration) - cet },
    };
  }, [clip.cst, clip.cet]);

  function onClip({ changeTime }: any, target: 'start' | 'end' | 'center') {
    let { cst, cet } = clip;

    const { min, max } = limit[target];

    if (changeTime < min) {
      changeTime = min;
    } else if (changeTime > max) {
      changeTime = max;
    }

    switch (target) {
      case 'start':
        if (actionType !== 'cut') {
          cst += changeTime;
        }
        break;
      case 'end':
        if (actionType !== 'cut') {
          cet += changeTime;
        }
        break;
      default:
        cst += changeTime;
        cet += changeTime;
    }

    setClip({ cst, cet });
    handleSetCurrentTime(target === 'end' ? cet : cst);

    return { cst, cet };
  }

  // 阻止触发快捷键
  useEffect(() => {
    const dom = document.querySelector(
      '.background-video-clip-modal-content',
    ) as HTMLInputElement;

    if (dom) {
      dom.focus();
    }
  }, []);

  return (
    <div
      className="background-video-clip-modal-content"
      tabIndex={1}
      onKeyDown={stopPropagation}
    >
      <video
        ref={videoRef}
        // controls
        width="100%"
        height={320}
        src={data.preview_video}
        onCanPlay={() => onCanPlay()}
      />

      <div className="clip-modal-content-bottom">
        <div className="clip-modal-play-video">
          <div className="clip-modal-play-video-icon" onClick={handlePlayAudio}>
            <XiuIcon type={state.isPlaying ? 'iconzanting' : 'iconbofang'} />
          </div>
          <div style={{ fontSize: 12 }}>
            {formatNumberToTime(parseInt(`${currentTime / 1000}`, 10))} /
            {formatNumberToTime(parseInt(`${data.duration / 1000}`, 10))}
          </div>
        </div>

        <div style={{ height: 47, position: 'relative', flex: 1 }}>
          <div
            style={{
              borderLeft: '2px solid #ff0000 ',
              height: '100%',
              position: 'absolute',
              left: `${Math.floor(
                (currentTime / Number(data.duration)) * 100,
              )}%`,
              zIndex: 100,
            }}
          />
          <Track
            overlayClassName="background-video-clip-track"
            duration={data.duration}
            startTime={clip.cst}
            endTime={clip.cet}
            onChange={onClip}
            onFinish={({ target, extra }) => {
              const cutDuration = extra ? extra.cet - extra.cst : 0;

              if (!hasClip && trigger) {
                setHasClip(true);
                clickActionWeblog('videoClip', { action_label: trigger });
              }

              if (cutDuration >= maxDuration && target !== 'center') {
                message.info('视频时长已达到最大限制');
              }
            }}
          />
          <Rail
            assetDuation={data.duration}
            assetHeight={data.height}
            assetWidth={data.width}
            assetUrl={data.preview_video}
          />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 30 }}>
        <Button style={{ width: 156, height: 38 }} onClick={onCancel}>
          取消
        </Button>
        <Button
          type="primary"
          style={{ width: 156, height: 38, marginLeft: 8 }}
          onClick={() => onOk(clip)}
        >
          确认
        </Button>
      </div>
    </div>
  );
}
