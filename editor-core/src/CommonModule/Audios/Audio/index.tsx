import { message, Tooltip } from 'antd';
import {
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent,
  CSSProperties,
} from 'react';
import {
  toJS,
  MultipleAudio,
  observer,
  assetBlur,
  getTemplateTimeScale,
  getAllAudios,
} from '@hc/editor-core';
import classNames from 'classnames';
import { useSetState, useClickAway, useUpdateEffect } from 'ahooks';
import XiuIcon from '@/components/XiuIcon';

import { audioMinDuration } from '@/config/basicVariable';

import Wavesurfer from '@/components/Wavesurfer';
import { useSetMusic } from '@/hooks/useSetMusic';
import {
  useSetActiveAudio,
  updateActiveAudioDuration,
} from '@/store/adapter/useAudioStatus';
import { mouseMoveDistance, stopPropagation } from '@/utils/single';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';

import { clickActionWeblog } from '@/utils/webLog';

import { useTimeAxis } from '@/pages/Designer/Bottom/hooks';

import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';

import Contextmenu from '../Contextmenu';

import './index.less';

type MoveTarget = 'start' | 'end' | 'center' | 'cut';
interface AudioProps {
  data: MultipleAudio;
  style?: CSSProperties;
  active: boolean;
  trackIndex: number;
  connect?: boolean;
  autoScroll?: boolean;
  setAuxiliaryLine: (position: number) => void;
}

interface Duration {
  startTime: number;
  endTime: number;
}

function getAudioAuxiliaryLine(unitWidth: number, id: number) {
  const timeScale = getTemplateTimeScale();
  const audios = getAllAudios();
  const arr: number[] = [];

  function toPx(time: number) {
    return (time / 1000) * unitWidth;
  }

  timeScale.forEach(([start, end]) => {
    arr.push(toPx(start), toPx(end));
  });

  audios.forEach(({ startTime, endTime, rt_id, speed = 1 }) => {
    if (id !== rt_id) {
      arr.push(toPx(startTime), toPx(endTime / speed));
    }
  });
  return arr;
}

function Audio({
  data,
  style,
  active,
  trackIndex,
  setAuxiliaryLine,
  setTrackZIndex,
  autoScroll = true,
}: PropsWithChildren<AudioProps>) {
  const { endTime: allTemplateVideoTime } = useTimeAxis();
  const { isPlaying } = useCanvasPlayHandler();

  const unitWidth = useGetUnitWidth(); // 一秒钟代表的宽度

  const { updateActiveAudio, inCliping, setActiveAudioInCliping, activeAudio } =
    useSetActiveAudio();
  const {
    startTime,
    endTime,
    rt_duration,
    rt_id,
    rt_title,
    rt_sourceType,
    rt_url,
    speed = 1,
  } = data;
  const isInClip = inCliping === trackIndex && active;
  const [cutStartTime, cutEndTime] = data.cut || [0, endTime - startTime];

  const duration = endTime - startTime;
  // 时间轴上展示的 endTime
  const endTimeWithSpeed = startTime + duration / speed;

  const { bindSetAudioDuration, bindSetAudioCut } = useSetMusic();

  const [moveTaget, setMoveTaget] = useState<MoveTarget>();
  const [playing, setPlaying] = useState(false);

  const [audioSize, setAudioSize] = useSetState<{
    width: number;
    left: number;
  }>({
    width: 0,
    left: 0,
  });
  // 移动相对位置
  const [transform, setTransfrom] = useSetState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const [absolutePosition, setAbsolutePosition] = useState(0);
  const [tip, setTip] = useState(-1);
  const [waveOffsetX, setWaveOffsetX] = useState(0);

  const audioRef = useRef<HTMLDivElement>(null);
  const [contextmenuVisible, setContextmenuVisible] = useState(false);
  const moreRef = useRef(null);

  // 第三个 ahooks v2.0 第三个参数eventName不支持数组
  useClickAway(() => setContextmenuVisible(false), [moreRef], 'contextmenu');
  useClickAway(() => setContextmenuVisible(false), [moreRef], 'click');

  const clipRange = useMemo(() => {
    return {
      start: {
        min: Math.max(-startTime, -cutStartTime) / speed,
        max: (endTime - startTime - audioMinDuration) / speed,
      },
      end: {
        min: -(endTime - startTime - audioMinDuration) / speed,
        max: Math.min(
          (rt_duration - cutEndTime) / speed,
          allTemplateVideoTime - (startTime + duration / speed),
        ),
      },
      center: {
        min: -startTime,
        max: allTemplateVideoTime - startTime - 100,
      },
      cut: {
        min: -(rt_duration - cutEndTime) / speed,
        max: cutStartTime / speed,
      },
    };
  }, [
    cutEndTime,
    allTemplateVideoTime,
    endTime,
    startTime,
    cutStartTime,
    speed,
    rt_duration,
  ]);

  // 更新音频数据数据
  function onFinish(
    params: { cut: Duration; duration: Duration },
    taget: MoveTarget,
  ) {
    const { duration, cut } = params;
    if (
      (taget === 'start' &&
        (duration.startTime === 0 || cut.startTime === 0)) ||
      (taget === 'end' &&
        (duration.endTime === allTemplateVideoTime ||
          cut.endTime >= rt_duration))
    ) {
      message.info('已经到底啦');
    }

    bindSetAudioDuration(params.duration, rt_id);
    bindSetAudioCut(params.cut, rt_id);
  }

  function getTime(change: number, target: MoveTarget) {
    const changeTime = Number(((change / unitWidth) * 1000).toFixed(0));

    let newStartTime = startTime;
    let newEndTime = endTime;

    let newCs = cutStartTime;
    let newCe = cutEndTime;
    const duration = endTime - startTime;

    if (isInClip) {
      newCs -= changeTime * speed;
      newCe = newCs + duration;
      setTip(newCs);
    } else if (target === 'start') {
      newStartTime += changeTime;
      newCs += changeTime * speed;
      // 因为是单音频倍速，start的位置就与倍速没有关系，永远都是单倍速的位置
      // 所以就要对应的修改 end的位置
      newEndTime -= changeTime * (speed - 1);
      setTip(newStartTime);
    } else if (target === 'end') {
      newEndTime += changeTime * speed;
      newCe += changeTime * speed;
      setTip(newEndTime);
    } else {
      newStartTime += changeTime;
      newEndTime = newStartTime + duration;

      const newEndTimeWithSpeed = newStartTime + duration / speed;

      if (newEndTimeWithSpeed > allTemplateVideoTime) {
        const diff = newEndTimeWithSpeed - allTemplateVideoTime;
        newEndTime = newStartTime + duration - diff * speed;
        newCe -= diff * speed;
        // newEndTime = allTemplateVideoTime;
        // newCe = newEndTime - newStartTime;
      }
    }

    return {
      duration: { startTime: newStartTime, endTime: newEndTime },
      cut: { startTime: newCs, endTime: newCe },
    };
  }

  function timeToPx(target: MoveTarget, x: number) {
    const { min, max } = clipRange[target];
    const minPx = (min / 1000) * unitWidth;
    const maxPx = (max / 1000) * unitWidth;

    if (x < minPx) {
      x = minPx;
    } else if (x > maxPx) {
      x = maxPx;
    }
    return x;
  }

  function getAauxiliaryPoint(data: number, auxiliaryLine: number[]) {
    let point = -1;
    let auxiliary = 1;
    for (const item of auxiliaryLine) {
      point = -1;
      if (Math.abs(item - data) < 10) {
        auxiliary = item - data;
        point = item;
        break;
      }
    }

    return {
      point,
      auxiliary,
    };
  }

  function webLog(target: MoveTarget) {
    let type = '';

    if (target === 'cut') {
      type = 'a_timeline_001';
    } else if (target === 'center') {
      type = 'a_timeline_007';
    } else {
      clickActionWeblog('a_timeline_008');
    }

    if (type) {
      clickActionWeblog(type);
    }
  }

  // 调整时长
  function onCliping(e: MouseEvent, target: MoveTarget) {
    assetBlur();
    e.preventDefault();

    setTrackZIndex(trackIndex);

    const auxiliaryLine = getAudioAuxiliaryLine(unitWidth, rt_id);
    let result: any;
    mouseMoveDistance(
      e,
      (x, y) => {
        if (Math.abs(x) <= 5) return;

        stopPropagation(e);
        let { width, left } = audioSize;
        let point = -1;
        let auxiliary: number;

        let auxiliaryPoint;

        if (target === 'start') {
          auxiliaryPoint = getAauxiliaryPoint(left + x, auxiliaryLine);
        } else if (target === 'end') {
          auxiliaryPoint = getAauxiliaryPoint(left + width + x, auxiliaryLine);
        } else if (target === 'center') {
          auxiliaryPoint = getAauxiliaryPoint(left + x, auxiliaryLine);
          if (auxiliaryPoint.point < 0) {
            auxiliaryPoint = getAauxiliaryPoint(
              left + width + x,
              auxiliaryLine,
            );
          }
        }
        if (auxiliaryPoint) {
          point = auxiliaryPoint.point;
          auxiliary = auxiliaryPoint.auxiliary + x;
        }

        const newX = timeToPx(target, auxiliary ?? x);

        if (auxiliary === newX && point >= 0) {
          setAuxiliaryLine(point);
        } else {
          setAuxiliaryLine(-1);
        }

        setMoveTaget(target);
        if (target === 'start') {
          left += newX;
          width -= newX;
          setWaveOffsetX(newX);
        } else if (target === 'end') {
          width += newX;
        } else {
          setTransfrom({ x: newX, y });
          setAbsolutePosition(left + newX);
        }

        // 计算时间
        result = getTime(newX, target);

        setAudioSize({ width, left });
      },
      () => {
        updateActiveAudio({ ...toJS(data), trackIndex });

        if (result) {
          onFinish(result, target);
          setMoveTaget(undefined);
          setTransfrom({ x: 0, y: 0 });
          setWaveOffsetX(0);
          setTip(-1);
          setAuxiliaryLine(-1);
          // 用户端埋点 - 拖动 a_timeline_001:拖动声纹 / a_timeline_007:拖动轨道
          webLog(target);
          const params = { ...result.duration };
          if (result.cut) {
            params.cut = [result.cut.startTime, result.cut.endTime];
          }
          updateActiveAudioDuration(params);
        }
      },
    );
  }

  useEffect(() => {
    setAudioSize({
      width: (((endTime - startTime) / 1000) * unitWidth) / speed,
      left: (startTime / 1000) * unitWidth,
    });
  }, [startTime, endTime, unitWidth, speed]);

  useEffect(() => {
    if (isPlaying || (rt_id !== activeAudio?.rt_id && playing)) {
      setPlaying(false);
    }
  }, [rt_id, activeAudio?.rt_id, playing, isPlaying]);

  // 倍速改变后宽度超出片段时长
  useUpdateEffect(() => {
    if (endTimeWithSpeed > allTemplateVideoTime) {
      const difference = (endTimeWithSpeed - allTemplateVideoTime) * speed;
      bindSetAudioDuration({ startTime, endTime: endTime - difference }, rt_id);
      bindSetAudioCut(
        {
          startTime: cutStartTime,
          endTime: cutEndTime - difference,
        },
        rt_id,
      );
    }
  }, [speed]);

  useEffect(() => {
    if (autoScroll && active) {
      setTimeout(() => {
        audioRef.current?.scrollIntoView({ block: 'center' });
        document
          .querySelector('.xiudodo-bottom-scrollX')
          ?.scrollTo((startTime / 1000) * unitWidth, 0);
        setTrackZIndex(trackIndex);
      }, 200);
    }
  }, [autoScroll]);

  return (
    <>
      <div
        className={classNames('audio-module-item', {
          'audio-module-item-simple': audioSize.width < 120,
          'audio-module-item-active': active,
          'audio-module-item-incliping': isInClip,
          'audio-module-item-moving': moveTaget === 'center',
        })}
        style={{
          ...audioSize,
          transform: isInClip
            ? 'unset'
            : `translateX(${transform.x}px) translateY(${transform.y}px)`,
        }}
        onMouseDown={e => {
          onCliping(e, isInClip ? 'cut' : 'center');
        }}
        // onClick={stopPropagation}
        onDoubleClick={() => {
          setActiveAudioInCliping(trackIndex);
        }}
        ref={audioRef}
      >
        <div className="audio-title-extra">{rt_title}</div>

        <div
          className={classNames('audio-module-item-content', {
            'audio-module-item-ai': rt_sourceType === 2,
          })}
          style={{
            overflow: isInClip ? 'unset' : 'hidden',
            pointerEvents: moveTaget ? 'none' : 'all',
          }}
        >
          <Tooltip
            title={`${(tip / 1000).toFixed(1)}s`}
            placement="right"
            visible
            getTooltipContainer={ele => ele}
          >
            <div
              style={{
                position: 'absolute',
                display:
                  !moveTaget || moveTaget === 'center' ? 'none' : 'block',
                ...(['start', 'cut'].includes(moveTaget || '')
                  ? { left: 10 }
                  : { right: 10 }),
              }}
            />
          </Tooltip>
          <Wavesurfer
            height={24}
            src={rt_url}
            audioRate={speed}
            progressColor={rt_sourceType === 2 ? '#5679A7' : '#5A4CDB'}
            playing={playing}
            onFinish={() => {
              setPlaying(false);
            }}
            start={cutStartTime / 1000}
            end={cutEndTime / 1000}
            waveColor={rt_sourceType === 2 ? '#9fb4d0' : '#a39de3'}
            style={{
              position: 'absolute',
              top: '50%',
              transform: `translateY(-50%) translateX(${
                isInClip ? transform.x : -waveOffsetX
              }px)`,
              zIndex: 1,
              width: ((rt_duration / 1000) * unitWidth) / speed,
              left: (-(cutStartTime / 1000) * unitWidth) / speed,
            }}
          />
          <div className="autio-detail">
            <span className="autio-duration">
              {((endTime - startTime) / 1000).toFixed(1)}s
            </span>
            <span
              className={classNames('autio-title', {
                'audio-ai-icon': rt_sourceType === 2,
              })}
              title={rt_title}
            >
              {rt_title}
            </span>
            {speed !== 1 && (
              <span className={classNames('autio-title', 'speed')}>
                倍速{speed}x
              </span>
            )}
          </div>

          <div
            className={classNames('active-autio-detail', {
              'active-autio-detail-playing': playing,
            })}
          >
            <span
              onClick={() => {
                setPlaying(!playing);
                clickActionWeblog('audioSpeed3');
              }}
              className={classNames('autio-title')}
              title={rt_title}
            >
              <div className="autio-title-play">
                <XiuIcon type={playing ? 'iconzanting' : 'iconbofang'} />
              </div>
              {!playing && <div className="autio-title-text">{rt_title}</div>}
            </span>
          </div>

          <div
            className="audio-module-clip audio-clip-left"
            onMouseDown={e => {
              stopPropagation(e);
              onCliping(e, 'start');
            }}
          >
            <XiuIcon type="iconhuoyunsuanfuhao" />
          </div>
          <div
            className="audio-module-clip audio-clip-right"
            onMouseDown={e => {
              stopPropagation(e);
              onCliping(e, 'end');
            }}
          >
            <XiuIcon type="iconhuoyunsuanfuhao" />
          </div>

          <Contextmenu trigger={['click']} visible={contextmenuVisible}>
            <div
              className={classNames('audio-more-action', {
                'audio-more-action-active': contextmenuVisible,
              })}
              ref={moreRef}
              onDoubleClick={stopPropagation}
              onMouseDown={e => {
                stopPropagation(e);
                setContextmenuVisible(true);
                updateActiveAudio({ ...toJS(data), trackIndex });
                clickActionWeblog('a_timeline_002');
              }}
            >
              <XiuIcon type="icongengduo_tianchong" />
            </div>
          </Contextmenu>

          {/* 淡入 */}
          {!!data.fadeIn && (
            <div
              className="audio-fade audio-fadeIn"
              style={{
                borderRightWidth: (data.fadeIn / 1000) * unitWidth, // 变量
              }}
            />
          )}
          {/* 淡出 */}
          {!!data.fadeOut && (
            <div
              className="audio-fade audio-fadeOut"
              style={{
                borderLeftWidth: (data.fadeOut / 1000) * unitWidth, // 变量
              }}
            />
          )}
        </div>
      </div>

      {moveTaget === 'center' && (
        <div
          className="audio_absolute"
          style={{
            width: audioSize.width,
            left: absolutePosition,
          }}
        />
      )}
    </>
  );
}

export default observer(Audio);
