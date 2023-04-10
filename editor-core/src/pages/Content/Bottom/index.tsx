import {
  useRef,
  useState,
  MouseEvent,
  SyntheticEvent,
  useLayoutEffect,
  useMemo,
} from 'react';
import { PlusSquareOutlined } from '@ant-design/icons';

import classNames from 'classnames';

import {
  observer,
  useAllTemplateVideoTimeByObserver,
  assetBlur,
  useVideoHandler,
  setCurrentTime,
  getTemplateTimeScale,
  setManualPreview,
} from '@hc/editor-core';

import {
  formatNumberToTime,
  mouseMoveDistance,
  stopPropagation,
} from '@/utils/single';

import { useDrop } from 'react-dnd';

import {
  useLeftSideInfo,
  useBottomMode,
  useSettingPanelInfo,
} from '@/store/adapter/useGlobalStatus';
import {
  setActiveAudioInCliping,
  audioBlur,
  useSetActiveAudio,
} from '@/store/adapter/useAudioStatus';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import { MUSIC_DRAG } from '@/constants/drag';
import { Audios } from '@/CommonModule/Audios';
import { videoPartWebLog } from '@/utils/webLog';

import Simple from './Simple';

import Actions from './Actions';
import ProgressLine from './ProgressLine';
import SelectedAsset from './SelectedAsset';
import Parts from './Parts';
import TimelineHandler from './TimelineHandler';
import PlayVideo from './PlayVideo';
import { useGetUnitWidth } from './handler';

import './index.less';

import BottomDrag from './Drag/bottomDrag';

const Time = observer(() => {
  const { currentTime } = useVideoHandler();
  const [allTemplateVideoTime] = useAllTemplateVideoTimeByObserver();
  const ct = ~~(currentTime / 1000);
  const at = ~~(+allTemplateVideoTime / 1000);

  return useMemo(() => (
    <>{formatNumberToTime(ct) + ' / ' + formatNumberToTime(at)}</>
  ), [ct, at]);
});

function Bottom() {
  const partsRef = useRef<HTMLDivElement>(null);
  const scrollClientRef = useRef<HTMLDivElement>(null);
  const [clipStatus, setClipStatus] = useState<
    { index: number; target: 'start' | 'end' } | undefined
  >();

  const [height, setHeight] = useState(225);
  const [audioAutoScrollIntoView, setAudioAutoScrollIntoView] = useState(false);

  const { inCliping } = useSetActiveAudio();
  const { close: closeSettingInfo } = useSettingPanelInfo();
  const { openSidePanel } = useLeftSideInfo();

  const unitWidth = useGetUnitWidth();

  // const { currentTime } = useVideoHandler();
  // const [allTemplateVideoTime] = useAllTemplateVideoTimeByObserver();
  const { isPlaying, pauseVideo, playVideo } = useCanvasPlayHandler();

  const { value: bottomMode } = useBottomMode();

  useLayoutEffect(() => {
    setAudioAutoScrollIntoView(true);
  }, []);

  function handleScrollX(eve: any) {
    const dom = scrollClientRef.current;
    if (dom) {
      dom.scrollLeft +=
        eve.deltaY !== undefined
          ? eve.deltaY
          : eve.detail !== undefined && eve.detail !== 0
            ? eve.detail
            : -eve.wheelDelta;
    }
  }

  // 选中模板、设置当前时间
  const onSelect = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isPlaying) {
      pauseVideo();
    }

    const click = e.clientX;

    const pastsNode = document.querySelectorAll('.xiudodo-bottom-part-wrap');

    const timeScale = getTemplateTimeScale();

    let time = useVideoHandler().currentTime;
    const [allTemplateVideoTime] = useAllTemplateVideoTimeByObserver();

    pastsNode.forEach((item, index) => {
      const { x, width } = item.getBoundingClientRect();

      const [start, end] = timeScale[index];

      if (click >= x && click < x + width) {
        time = ((click - x) / width) * (end - start) + start;
        setCurrentTime(Math.ceil(time), false);
      }
    });

    if (e.target.className !== 'part-clip-handler') {
      // 移动过程中吸附效果
      mouseMoveDistance(
        e,
        distanceX => {
          if (Math.abs(distanceX) > 0) {
            setManualPreview(true);
            let temp = time + Math.floor((distanceX / unitWidth) * 1000);
            if (temp < 0) {
              temp = 0;
            } else if (temp > allTemplateVideoTime) {
              temp = allTemplateVideoTime;
            }

            timeScale.forEach(([start, end]) => {
              if (
                temp > start &&
                temp < end &&
                end - temp < Math.min(Math.floor((10 / unitWidth) * 1000), 1000)
              ) {
                temp = end;
              }
            });

            setCurrentTime(temp, false);
          }
        },
        () => {
          setManualPreview(false);
          videoPartWebLog('dragPlay');
        },
      );
    }
  };

  function handleResize(event: SyntheticEvent) {
    stopPropagation(event);
    event.preventDefault();
    event.nativeEvent.preventDefault();
    mouseMoveDistance(event, (distanceX, distanceY) => {
      let newHeight = height - distanceY;
      if (newHeight > 450) {
        newHeight = 450;
      } else if (newHeight < 215) {
        newHeight = 215;
      }
      setHeight(newHeight);
    });
  }
  // 音乐的拖拽释放
  const [collectedProps, drop] = useDrop(() => ({
    accept: MUSIC_DRAG,
    collect: monitor => ({
      hover: !!monitor.isOver() && !!monitor.canDrop(),
      position: monitor.getDifferenceFromInitialOffset(),
    }),
    drop: (item: any, monitor) => {
      const initOffset = monitor.getInitialClientOffset() || { x: 0, y: 0 };
      const position = monitor.getClientOffset() || { x: 0, y: 0 };
      const { x = 0 } = scrollClientRef.current?.getBoundingClientRect() || {
        x: 0,
        y: 0,
      };
      const left = position.x - x - (initOffset.x - item?.mousePosition.x);
      // todo 注意修改xiudodo-bottom-scrollX的paddingleft值时候，6也需改改成对应值
      item?.add({ ...position, relativeX: left - 6 });
    },
  }));

  return (
    <div
      id="xiudodo-bottom"
      className="xiudodo-bottom-wrap"
      ref={drop}
      style={{ height }}
    >
      {/* 拖拽蒙层 */}
      <BottomDrag {...collectedProps} />
      <div className="bottom-resize-line" onMouseDown={handleResize} />
      {bottomMode === 'simple' ? (
        <Simple />
      ) : (
        <>
          <div
            className="xiudod-bottom-handler"
            onMouseDown={() => {
              audioBlur();
              assetBlur();
              if (isPlaying) {
                pauseVideo();
              }
            }}
          >
            {!isPlaying && <Actions />}
            <div className="xiudodo-bottom-videoTime">
              <PlayVideo />
              <Time />
            </div>
            {!isPlaying && <TimelineHandler />}
          </div>
          <div
            className={classNames('xiudodo-bottom-scrollX', {
              'xiudodo-bottom-audio-incliping': inCliping > -1,
            })}
            ref={scrollClientRef}
            // onWheel={handleScrollX}
            onMouseDown={e => {
              // assetBlur();
              setActiveAudioInCliping(-1);
              onSelect(e);
              closeSettingInfo();
            }}
          // onClick={onSelect}
          >
            <ProgressLine />
            <div
              className="xiudodo-bottom-scrollX-content"
              id="xiudodo-bottom-scrollX-content"
            >
              {/* 选中的元素 */}
              <div className="xiudodo-bottom-selected-asset">
                <SelectedAsset />
              </div>

              {/* 片段 */}
              <div
                className={classNames('xiudodo-bottom-parts')}
                id="xiudodo-bottom-parts"
                ref={partsRef}
                onMouseDown={() => {
                  audioBlur();
                  assetBlur();
                }}
              >
                <Parts setClipStatus={setClipStatus} clipStatus={clipStatus} />
              </div>

              {/* 音频 */}
              <Audios
                wrapClassName="xiudodo-bottom-audios-wrap"
                className="xiudodo-bottom-audios"
                autoScroll={audioAutoScrollIntoView}
                empty={
                  <div
                    className="bottom-empty-audio"
                    onMouseDown={e => {
                      stopPropagation(e);
                      openSidePanel({ menu: 'music' });
                      closeSettingInfo();
                    }}
                    style={{ width: '60%' }}
                  >
                    <PlusSquareOutlined /> 背景音乐
                  </div>
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default observer(Bottom);
