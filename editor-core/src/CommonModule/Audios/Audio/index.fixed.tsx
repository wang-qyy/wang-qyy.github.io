import { Tooltip } from 'antd';
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { toJS, MultipleAudio, observer, assetHandler } from '@hc/editor-core';
import classNames from 'classnames';
import { useSize, useClickAway } from 'ahooks';

import { audioMinDuration } from '@/config/basicVariable';

import Wavesurfer from '@/components/Wavesurfer';
import { useSetMusic } from '@/hooks/useSetMusic';
import { useSetActiveAudio } from '@/store/adapter/useAudioStatus';
import {
  mouseMoveDistance,
  stopPropagation,
  formatNumberToTime,
} from '@/utils/single';
import getUrlParams from '@/utils/urlProps';
import { clickActionWeblog } from '@/utils/webLog';

import { useTimeAxis } from '@/pages/Designer/Bottom/hooks';
import Clip, { OnClipParams } from '@/pages/Designer/Bottom/component/Clip';
import { useGetUnitWidth } from '@/pages/Content/Bottom/handler';

import Contextmenu from '../Contextmenu';

import './index.less';

const { redirect } = getUrlParams();

const { assetBlur, getTemplateTimeScale, useGetAllTemplateByObserver } =
  assetHandler;

interface AudioProps {
  data: MultipleAudio;
  style?: CSSStyleSheet;
  active: boolean;
  trackIndex: number;
  connect?: boolean;
}

function Audio({
  data,
  style,
  active,
  trackIndex,
  connect,
}: PropsWithChildren<AudioProps>) {
  const { endTime: allTemplateVideoTime } = useTimeAxis();

  const unitWidth = useGetUnitWidth();

  const [cutTip, setCutTip] = useState(false);
  const { templates } = useGetAllTemplateByObserver();

  const { updateActiveAudio, inCliping, setActiveAudioInCliping } =
    useSetActiveAudio();
  const { startTime, endTime, rt_duration, rt_id, rt_title, rt_sourceType } =
    data;
  const [cutStartTime, cutEndTime] = data.cut || [0, endTime - startTime];

  const { bindSetAudioCut, bindSetAudioDuration } = useSetMusic();
  const wrapRef = useRef(null);
  const { width = 0 } = useSize(wrapRef);

  // 音波样式
  const getWaveStyle = (start: number) => {
    return {
      width: (rt_duration / 1000) * unitWidth,
      left: -(start / 1000) * unitWidth,
    };
  };

  // 音频样式
  const wrapStyle = useMemo(() => {
    const templateTimeScale = getTemplateTimeScale();

    let startIndex = 0;

    templateTimeScale.forEach(([templateStart, templateEnd], index) => {
      if (startTime > templateStart && startTime < templateEnd) {
        startIndex = index;
      }
    });

    const left = (startTime / 1000) * unitWidth + startIndex * 18;

    return { left };
  }, [startTime, unitWidth]);

  const clipRange = useMemo(() => {
    return {
      start: {
        min: Math.max(-startTime, -cutStartTime),
        max: endTime - startTime - audioMinDuration,
      },
      end: {
        min: -(endTime - startTime - audioMinDuration),
        max: Math.min(
          data.rt_duration - cutEndTime,
          allTemplateVideoTime - endTime,
        ),
      },
      center: {
        min: -startTime,
        max: allTemplateVideoTime - endTime,
      },
      cut: { min: -(rt_duration - cutEndTime), max: cutStartTime },
    };
  }, [startTime, endTime, cutStartTime, cutEndTime, allTemplateVideoTime]);

  // 音频裁剪及出现时长调整
  function handleAudioCut({ distance, target }: OnClipParams) {
    let newStartTime = startTime;
    let newEndTime = endTime;

    let changeTime = Math.ceil((distance / unitWidth) * 1000);

    const { min, max } = clipRange[inCliping > -1 ? 'cut' : target];

    if (changeTime > max) {
      changeTime = max;
    } else if (changeTime < min) {
      changeTime = min;
    }

    let cutStart = cutStartTime;
    let cutEnd = cutEndTime;

    if (inCliping > -1) {
      //  拖动 音波裁剪
      cutEnd -= changeTime;
      cutStart -= changeTime;
    } else if (target === 'start') {
      newStartTime += changeTime;
      cutStart += changeTime;
    } else if (target === 'end') {
      newEndTime += changeTime;
      cutEnd += changeTime;
    } else {
      // 拖动中间调整出现位置
      newStartTime += changeTime;
      newEndTime += changeTime;
    }

    if (target || inCliping > -1) {
      bindSetAudioCut(
        {
          startTime: cutStart,
          endTime: cutEnd,
        },
        rt_id,
      );
    }

    if (inCliping === -1) {
      bindSetAudioDuration(
        { startTime: newStartTime, endTime: newEndTime },
        rt_id,
      );
    }
  }

  useEffect(() => {
    if (!active && inCliping > -1) {
      setActiveAudioInCliping(-1);
    }

    // if (active) {
    //   wrapRef.current?.scrollIntoView(true);
    // }
  }, [active]);

  const renderAudioRegion = useMemo(() => {
    const templateTimeScale = getTemplateTimeScale();

    const region: number[][] = [];

    let tempStart = startTime;
    const tempEnd = endTime;

    let tempCutStart = cutStartTime;
    let tempCutEnd;

    for (let i = 0; i < templateTimeScale.length; i++) {
      const [templateStartTime, templateEndTime] = templateTimeScale[i];

      tempCutEnd = tempCutStart + (templateEndTime - tempStart);
      if (tempStart < templateEndTime && tempEnd > templateEndTime) {
        region.push([tempCutStart, tempCutEnd]);
        tempStart = templateEndTime;
        tempCutStart = tempCutEnd;
      }

      if (tempStart < templateEndTime) {
        region.push([tempCutStart, Math.min(cutEndTime, tempCutEnd)]);
        break;
      }
    }

    return region;
  }, [startTime, endTime, cutEndTime, cutStartTime, templates.length]);

  const time = useRef();
  const moreRef = useRef();

  const [contextmenuVisible, setContextmenuVisible] = useState(false);

  // 第三个 ahooks v2.0 第三个参数eventName不支持数组
  useClickAway(() => setContextmenuVisible(false), [moreRef], 'contextmenu');
  useClickAway(() => setContextmenuVisible(false), [moreRef], 'click');

  const [transform, setTransfrom] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  function onMove(e) {
    mouseMoveDistance(
      e,
      (x, y) => {
        setTransfrom({ x, y });
      },
      () => {
        setTransfrom({ x: 0, y: 0 });
      },
    );
  }

  return (
    <>
      <Tooltip
        title={`${(cutStartTime / 1000).toFixed(1)}s`}
        getTooltipContainer={ele => ele}
        arrowContent
        visible={cutTip}
        placement="right"
      >
        <div
          style={{
            width: 0,
            height: '100%',
            position: 'absolute',
            top: 0,
            ...wrapStyle,
          }}
        />
      </Tooltip>
      <Clip
        className={classNames('audio-clip', {
          'audio-incliping': inCliping > -1 && active,
        })}
        active
        style={{
          ...style,
          ...wrapStyle,
        }}
        onClip={handleAudioCut}
        onClipFinish={({ extra, distance }) => {
          updateActiveAudio({ trackIndex, ...toJS(data) });
          // 用户端埋点
          if (!redirect && distance) {
            clickActionWeblog('a_timeline_008');
          }
        }}
        handlerToolTip={{
          start: `${formatNumberToTime(parseInt(`${startTime / 1000}`, 10))}s`,
          end: `${formatNumberToTime(parseInt(`${endTime / 1000}`, 10))}s`,
        }}
        handlerIcon="iconshuxian"
      >
        <div
          ref={wrapRef}
          className={classNames('wave-wrap')}
          style={{ opacity: active ? 1 : 0.6 }}
          onMouseDown={e => {
            if (inCliping > -1 && active) {
              stopPropagation(e);
            }
            e.preventDefault();

            clearTimeout(time.current);
            updateActiveAudio({ trackIndex, ...toJS(data) });
            assetBlur();

            if (inCliping > -1) {
              setCutTip(true);
            }
            mouseMoveDistance(
              e,
              distance => {
                handleAudioCut({ distance, target: 'center' });
              },
              distanceX => {
                updateActiveAudio({ trackIndex, ...toJS(data) });

                setCutTip(false);
                // 用户端埋点 - 拖动 a_timeline_001:拖动声纹 / a_timeline_003:拖动轨道
                if (!redirect && distanceX) {
                  clickActionWeblog(
                    inCliping > -1 ? 'a_timeline_001' : 'a_timeline_007',
                  );
                }
              },
            );
          }}
          onDoubleClick={() => {
            clearTimeout(time.current);
            setActiveAudioInCliping(trackIndex);
          }}
        >
          <div
            className="cutted-wrap"
            style={{
              background: Number(rt_sourceType) === 2 ? '#51DB86' : '#5646ED',
            }}
          >
            {renderAudioRegion.map((item, index) => {
              const [cutStart, cutEnd] = item;

              return [
                <div
                  className="audio-connect"
                  key={`space-${index}`}
                  hidden={!index || !connect}
                />,
                <div
                  key={`cutted-${index}`}
                  style={{
                    position: 'relative',
                    width: ((cutEnd - cutStart) / 1000) * unitWidth,
                    height: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <Wavesurfer
                    height={28}
                    src={data.rt_url}
                    style={{
                      position: 'absolute',
                      height: '100%',
                      ...getWaveStyle(cutStart),
                    }}
                    waveColor="rgba(255,255,255,0.8)"
                  />
                </div>,
              ];
            })}
          </div>
          {active && inCliping > -1 && (
            <Wavesurfer
              height={26}
              src={data.rt_url}
              waveColor={Number(rt_sourceType) === 2 ? '#38C26D' : '#867be7'}
              style={{
                position: 'absolute',
                top: 0,
                zIndex: 1,
                height: '100%',
                ...getWaveStyle(cutStartTime),
              }}
            />
          )}
          {inCliping === -1 && (
            <>
              <span
                hidden={!active || Number(rt_sourceType) === 2}
                className="audio-info-wrap audio-duration"
              >
                {((endTime - startTime) / 1000).toFixed(1)}s
              </span>
              <span
                hidden={Number(rt_sourceType) !== 2 || width < 60}
                className="audio-info-wrap audio-title"
                title={rt_title}
              >
                {rt_sourceType === 2 && (
                  <span className="audio-ai-icon">AI</span>
                )}

                {rt_title}
              </span>
              {active && (
                <Contextmenu visible={contextmenuVisible} trigger={['click']}>
                  <div
                    ref={moreRef}
                    hidden={width < 160}
                    className="audio-info-wrap audio-more-action"
                    onDoubleClick={stopPropagation}
                    onMouseDown={e => {
                      stopPropagation(e);
                      setContextmenuVisible(true);
                      // 用户端埋点
                      if (!redirect) {
                        clickActionWeblog('a_timeline_002');
                      }
                    }}
                  >
                    ···
                  </div>
                </Contextmenu>
              )}
            </>
          )}
        </div>
      </Clip>
    </>
  );
}

export default observer(Audio);
