import {
  CSSProperties,
  MouseEvent,
  useEffect,
  useRef,
  PropsWithChildren,
  useMemo,
  useState,
  useLayoutEffect,
} from 'react';
import { message, Tooltip } from 'antd';
import classNames from 'classnames';
import { Draggable } from 'react-beautiful-dnd';
import { useDrop } from 'react-dnd';
import {
  observer,
  toJS,
  StaticTemplate,
  useCurrentTemplate,
  assetBlur,
  useAllTemplateVideoTimeByObserver,
  useTemplateClip,
  getAllTemplates,
  getAllTemplateVideoTime,
  useGetCurrentAsset,
  setCurrentTime,
  setCurrentTimeWithThrottle,
  getVideoCurrentTime,
  getTemplateTimeScale,
  TemplateClass,
  setTempPreviewCurrentTime,
  setPreviewCurrentTime,
  useTemplateLoadByObserver,
} from '@hc/editor-core';
import { TEMPLATE_DRAG } from '@/constants/drag';
import { RGBAToString, stopPropagation } from '@/utils/single';
import {
  templateTotalDurationLimit,
  TEMPLATE_MIN_DURATION,
  TEMPLATE_MIN_DURATION_TRANSFER,
} from '@/config/basicVariable';

import { useSetActiveAudio } from '@/store/adapter/useAudioStatus';
import { useUpdateCanvasInfo } from '@/store/adapter/useTemplateInfo';
import { clickActionWeblog } from '@/utils/webLog';
import { afterReplace } from '@/hooks/useAddTemplate';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';

import KeyPress from './KeyPress';

import ContextMenu from '../ContextMenu';
import { handleScroll, useGetUnitWidth, formatTime } from '../../handler';

import Transition from '../Transition';

import './index.less';

const getItemStyle = (isDragging: boolean, draggableStyle: CSSProperties) => {
  const style = {
    // padding: grid * 2,
    // margin: `0 ${grid}px 0 0`,

    // background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle,
  };
  if (isDragging) {
    style.zIndex = 1000000;
  }
  return style;
};

interface ItemProps {
  data: TemplateClass;
  index: number;
  disableDelete?: boolean;
  disableCopy?: boolean;
  style?: CSSProperties;
  dragging?: boolean;
  isLast?: boolean;
  wrap?: any;
  setClipStatus: (params: {
    target?: string;
    index: number;
    justifyContent?: CSSProperties['justifyContent'];
    width?: number;
  }) => void;
  clipStatus: string;
}

const Item = (props: PropsWithChildren<ItemProps>) => {
  const {
    data,
    index,
    disableDelete,
    disableCopy,
    style,
    dragging,
    isLast,
    setClipStatus,
    clipStatus,
    handleSetClipingStyle,
    ...others
  } = props;

  const unitWidth = useGetUnitWidth();
  const [videoTotalTime] = useAllTemplateVideoTimeByObserver();
  const currentAsset = useGetCurrentAsset();
  const { activeAudio } = useSetActiveAudio();
  const { isPlaying } = useCanvasPlayHandler();
  const { loadComplete } = useTemplateLoadByObserver();

  // console.log(toJS(data));

  const [templateClip, update] = useTemplateClip(index);

  const { template } = useCurrentTemplate();
  const [allTemplateVideoTime] = useAllTemplateVideoTimeByObserver();

  const { value: canvasInfo } = useUpdateCanvasInfo();

  const handleEndRef = useRef(null);

  const [clipStyle, setClipStyle] = useState<CSSProperties>();
  const [clipingValue, setClipValue] = useState(0);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loadComplete && !loaded) {
      setLoaded(true);
    }
  }, [loadComplete, loaded]);

  const active = template?.id === data.id;
  const { allAnimationTimeBySpeed: pageTime, speed = 1 } = data.videoInfo || {};
  const [collectedProps, drop] = useDrop(() => ({
    accept: TEMPLATE_DRAG,
    collect: monitor => ({
      hover: !!monitor.isOver() && !!monitor.canDrop(),
    }),
    drop: (item: any) => {
      item?.replace('bottom');
    },
  }));
  useEffect(() => {
    if (collectedProps.hover) {
      afterReplace(index);
    }
  }, [collectedProps.hover]);
  useEffect(() => {
    const currentTime = getVideoCurrentTime();
    if (currentTime > videoTotalTime) {
      setCurrentTime(videoTotalTime);
    }
  }, [videoTotalTime]);

  const postWidth = useMemo(() => {
    return (pageTime / 1000) * unitWidth;
  }, [pageTime, unitWidth]);

  const clipRange = useMemo(() => {
    const allTemplates = getAllTemplates();
    const selectedTemp = allTemplates[index];

    const minPageTime =
      data.startTransfer || data.endTransfer
        ? TEMPLATE_MIN_DURATION_TRANSFER
        : TEMPLATE_MIN_DURATION;

    const range = {
      start: {
        min: Math.max(
          -templateClip[0],
          -(templateTotalDurationLimit - allTemplateVideoTime),
        ),
        max: selectedTemp.videoInfo.allAnimationTimeBySpeed - minPageTime,
      },
      end: {
        min: -(selectedTemp.videoInfo.allAnimationTimeBySpeed - minPageTime),
        max: templateTotalDurationLimit - allTemplateVideoTime,
      },
    };

    return range;
  }, [...templateClip, allTemplateVideoTime]);

  const itemHeight = 50;

  const renderPosts = useMemo(() => {
    if (postWidth <= 0) return;

    const scale = itemHeight / canvasInfo.height;

    const canvasWidth = canvasInfo.width * scale;

    const total = Math.ceil(postWidth / canvasWidth);

    const step = pageTime / total;
    const posts = [];

    for (let i = 0; i < total; i++) {
      posts.push(
        <StaticTemplate
          key={`${data.id}-${step * i}`}
          canvasInfo={{ ...canvasInfo, scale }}
          currentTime={step * i}
          templateIndex={index}
        />,
      );
    }

    return posts;
  }, [postWidth, index]);

  function handleClip(d: number, target: 'start' | 'end') {
    let newWidth = postWidth;
    let distance = d;

    const { min, max } = clipRange[target];

    const maxChangDistance = (max / 1000) * unitWidth;
    const minChangDistance = (min / 1000) * unitWidth;

    if (distance > maxChangDistance) {
      distance = maxChangDistance;
    } else if (distance < minChangDistance) {
      distance = minChangDistance;
    }

    const changeTime = (distance / unitWidth) * 1000;

    const unSpeedChangeTimeSpeed = changeTime / (1 / speed);

    let [clipStart, clipEnd] = templateClip;

    if (target === 'start') {
      newWidth -= distance;
      clipStart += unSpeedChangeTimeSpeed;
      setClipValue(changeTime);
    } else {
      newWidth += distance;
      clipEnd -= unSpeedChangeTimeSpeed;
      setClipValue(-changeTime);
    }

    setClipStatus({ target, index });

    setClipStyle({ width: newWidth });

    return [clipStart, clipEnd];
  }

  function onClipFinish(extra: [number, number], target: string) {
    if (extra) {
      clickActionWeblog('template_clip');

      update(extra);

      setTimeout(() => {
        const allTime = getAllTemplateVideoTime();

        if (allTime >= templateTotalDurationLimit) {
          message.info('视频时长已达到最大限制');
        } else if (target === 'start' && extra[0] === 0) {
          message.info('模板已经拖到头了');
        }
      });
    }

    setClipStatus();
    setClipStyle(undefined);
    setClipValue(0);
  }

  const scrollDom = document.querySelector(
    '.xiudodo-bottom-scrollX',
  ) as HTMLElement;

  function onClip(e: MouseEvent<HTMLElement>, target: 'start' | 'end') {
    assetBlur();
    stopPropagation(e);
    e.preventDefault();
    let extra: any;
    const allTemplates = getAllTemplates();
    const { pageTime } = allTemplates[index].videoInfo;
    const timeScale = getTemplateTimeScale()?.[index] || [0, 0];
    const templateStartTime = timeScale[0];
    const templateEndTime = templateStartTime + pageTime;

    handleScroll({
      e,
      target,
      targetScroll: scrollDom,
      moving({ distanceX, justifyContent, fixedWidth }) {
        extra = handleClip(distanceX, target);
        if (target === 'start') {
          const result = templateStartTime + extra[0];
          if (result >= 0) {
            setTempPreviewCurrentTime({
              templateIndex: index,
              currentTime: extra[0] + 10,
            });
            // setCurrentTimeWithThrottle(result, false);
          }
        } else {
          const result = templateEndTime - extra[1] - 10;
          if (result < templateEndTime) {
            setTempPreviewCurrentTime({
              templateIndex: index,
              currentTime: extra[1] - 10,
            });
            // setCurrentTimeWithThrottle(
            //   Math.min(templateEndTime - extra[1], templateEndTime),
            //   false,
            // );
          }
        }
        handleSetClipingStyle(justifyContent, fixedWidth);
      },
      finish() {
        onClipFinish(extra, target);

        setTempPreviewCurrentTime(undefined);
      },
    });
  }

  const partRef = useRef<HTMLButtonElement>(null);

  const selectedCurrent = active && !currentAsset && !activeAudio;

  // useEffect(() => {
  //   if (selectedCurrent) {
  //     partRef.current?.focus();
  //   } else {
  //     partRef.current?.blur();
  //   }
  // }, [selectedCurrent]);

  useEffect(() => {
    if (!active || isPlaying || activeAudio) {
      partRef.current?.blur();
    }
  }, [isPlaying, active, activeAudio]);

  // 新增片段自动滚动到可视区内
  useLayoutEffect(() => {
    document.querySelector('.xiudodo-bottom-scrollX')?.scrollTo({
      left: partRef.current?.offsetLeft,
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return (
    <ContextMenu template={data} templateIndex={index} isLast={isLast}>
      <button
        tabIndex={index}
        className={classNames('xiudodo-bottom-part-wrap', {
          'xiudodo-bottom-part-selected': active,
          'xiudodo-bottom-part-simple': clipStyle?.width ?? postWidth < 40,
        })}
        ref={partRef}
        style={{ ...style }}
        {...others}
        onMouseDown={() => {
          partRef.current?.focus();
        }}
        onContextMenu={e => {
          partRef.current?.focus();
        }}
      >
        <KeyPress templateIndex={index} template={data} target={partRef} />
        <div
          ref={drop}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: clipStyle?.width,
            pointerEvents: clipStatus?.target ? 'none' : 'all',
          }}
        >
          <Tooltip
            visible={clipStatus?.target === 'start'}
            title={formatTime(clipingValue)}
            placement="right"
            getPopupContainer={ele => ele}
          >
            <div
              className={classNames(
                'part-clip-handler',
                'part-clip-handler-start',
                {
                  'part-clip-handler-active':
                    clipStatus?.target === 'start' &&
                    clipStatus.index === index,
                },
              )}
              onMouseDown={e => onClip(e, 'start')}
            >
              |
            </div>
          </Tooltip>
          <Tooltip
            visible={clipStatus?.target === 'end'}
            title={formatTime(pageTime - clipingValue)}
            placement="left"
            getPopupContainer={ele => ele}
          >
            <div
              ref={handleEndRef}
              className={classNames(
                'part-clip-handler',
                'part-clip-handler-end',
                {
                  'part-clip-handler-active':
                    clipStatus?.target === 'end' && clipStatus.index === index,
                },
              )}
              onMouseDown={e => onClip(e, 'end')}
            >
              |
            </div>
          </Tooltip>
          <Draggable key={data.id} draggableId={`${data.id}`} index={index}>
            {(provided: any, snapshot: any) => (
              <div
                ref={provided.innerRef}
                className="xiudodo-bottom-part-border"
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={{
                  width: clipStyle?.width ?? postWidth,
                  overflow: 'hidden',
                  position: 'relative',
                  ...getItemStyle(
                    snapshot.isDragging,
                    provided.draggableProps.style,
                  ),
                }}
              >
                <div
                  ref={partRef}
                  className={classNames('xiudodo-bottom-part-poster', {
                    'item-clip': !!clipStatus?.target,
                  })}
                  style={{
                    backgroundColor: RGBAToString(
                      data.pageAttr.backgroundColor,
                    ),
                    zIndex: 1,
                    // ...(clipStatus?.target === 'start' && clipStyle
                    //   ? {
                    //       transform: `translateX(${
                    //         clipStyle.width - postWidth
                    //       }px)`,
                    //     }
                    //   : {}),
                  }}
                >
                  <div
                    style={{
                      width: postWidth,
                      display: 'flex',
                      transform: `translateX(${clipStyle?.width && clipStatus?.target === 'start'
                        ? clipStyle?.width - postWidth
                        : 0
                        }px)`,
                    }}
                  >
                    {renderPosts}
                  </div>
                  <div
                    className="xiudodo-bottom-part-mask"
                    style={{
                      opacity: collectedProps.hover ? 0.75 : 0,
                      // opacity: 1,
                    }}
                  />

                  <div className="xiudodo-bottom-part-loading" hidden={loaded}>
                    loading…
                  </div>

                  <div className="xiudodo-bottom-part-index">
                    {index < 9 ? 0 : ''}
                    {index + 1}
                  </div>
                  <div className="xiudodo-bottom-part-duration">
                    {formatTime(pageTime)}
                  </div>
                </div>
              </div>
            )}
          </Draggable>
        </div>
        {!isLast && !dragging && (
          <Transition
            data={data.endTransfer}
            templateIndex={index}
            key={`transition-${data.id}`}
          />
        )}
      </button>
    </ContextMenu>
  );
};

export default observer(Item);
