import { useEffect, useRef, useState } from 'react';
import { Slider } from 'antd';

import { useSize, useClickAway } from 'ahooks';

import {
  useAllTemplateVideoTimeByObserver,
  getTemplateTimeScale,
  getAudioList,
  observer,
  usePreviewHandlerByObserver,
  usePreviewPlayHandlerByObserver,
} from '@hc/editor-core';
import { XiuIcon } from '@/components';
import { useMusicStatus } from '@/store/adapter/useMusicStatus';
import { useSetMusic } from '@/hooks/useSetMusic';
import {
  mouseMoveDistance,
  formatNumberToTime,
  stopPropagation,
} from '@/utils/single';

import AudioClips from '@/pages/SetupSound/AudioClips';
import styles from './index.less';
import Drag from './Drag';
import TrackPopover from './TrackPopover';
import SetupSoundModal from '../SetupSoundModal';
import { ruler } from './ruler';

const BottomTrack = () => {
  const { isPlaying, playVideo, pauseVideo } =
    usePreviewPlayHandlerByObserver();
  const [offset, setOffset] = useState(0); // 存储移动方向类型
  const [addAudioButton, setAddAudioButton] = useState(true); // 添加按钮是否显示

  const bgmDragRef = useRef(null);
  const audioDragRef = useRef(null);
  const dragRef = useRef(null);
  const slideLineRef = useRef(null);
  const rulerRef = useRef(null);

  const { BGMList } = useSetMusic();
  const { currentTime, setCurrentTime } = usePreviewHandlerByObserver();
  const [videoTotalTime] = useAllTemplateVideoTimeByObserver(); // 获取播放总时间
  const { updateMusicStatus } = useMusicStatus();
  const size = useSize(dragRef);

  useClickAway(() => {
    setOffset(0);
  }, [bgmDragRef, audioDragRef]);

  // 判断播放进度位置，如果暂停并且不和配乐重叠就显示添加按钮
  const addAudioButtonShow = (value?: number) => {
    const time = value || currentTime;
    const audioList = getAudioList();
    if (audioList.length > 0) {
      let n = 0;
      for (let index = 0; index < audioList.length; index++) {
        const element = audioList[index];
        if (element.startTime < time && time < element.endTime) {
          break;
        } else {
          n += 1;
        }
      }
      n === audioList.length
        ? setAddAudioButton(true)
        : setAddAudioButton(false);
    } else {
      setAddAudioButton(true);
    }
  };

  const bindSildValue = (value: number, currentTim: number) => {
    const tim = currentTim / videoTotalTime + value;
    if (tim > 0 && tim < 1) {
      const time = currentTim + videoTotalTime * value;
      addAudioButtonShow(time);
      setCurrentTime(time);
    }
  };

  const winWidth = dragRef?.current?.offsetWidth || 1033;

  const handleMouseDown = (event: any, currentTim: number) => {
    event.preventDefault();
    stopPropagation(event);
    setOffset(0);
    if (pauseVideo) {
      pauseVideo();
    }

    mouseMoveDistance(event, distance => {
      bindSildValue(distance / winWidth, currentTim);
    });
  };

  const scenarioArr = getTemplateTimeScale().map(item => {
    return item[1] / videoTotalTime;
  });

  // 绑定改变时间，暂停播放，设置视频时间，判断添加按钮是否显示
  const bindSetCurrentTime = (value: number) => {
    pauseVideo();
    setCurrentTime(value * videoTotalTime);
    addAudioButtonShow(value * videoTotalTime);
  };

  // 调用刻度尺方法
  useEffect(() => {
    ruler.initPlugin({
      el: rulerRef, // 容器id
      startValue: 0,
      maxScale: parseInt(`${videoTotalTime / 1000}`, 10) * 10, // 最大刻度
      height: 30, // 刻度尺高度
      color: '#ABACAC', // 刻度线和字体的颜色
      scenario: scenarioArr || [],
      background: '#ffffff',
      success(res: any) {
        bindSetCurrentTime(res);
      },
    });
  }, [size]);

  // 监听是否播放，播放隐藏添加按钮，隐藏提示框
  useEffect(() => {
    if (!isPlaying) {
      addAudioButtonShow();
    } else {
      setAddAudioButton(false);
      setOffset(0);
    }
  }, [isPlaying]);

  return (
    <div className={styles.slideWarp} id="bottomTrack">
      <div className={styles.slideLeft}>
        <div className={styles.slideLeftLeft}>
          <div
            className={styles.slidePlay}
            onClick={isPlaying ? pauseVideo : playVideo}
          >
            <XiuIcon type={isPlaying ? 'iconzanting' : 'iconbofang'} />
          </div>
          <div className={styles.slideTime}>
            {formatNumberToTime(parseInt(`${currentTime / 1000}`, 10))} /
            {formatNumberToTime(parseInt(`${videoTotalTime / 1000}`, 10))}
          </div>
        </div>

        <div className={styles.slideLeftRight}>
          <span className={styles.rightSpan1}>视频轨道</span>
          <span className={styles.rightSpan2}>配乐</span>
          <span className={styles.rightSpan3}>背景音乐</span>
        </div>
      </div>
      <div className={styles.slideRightWarp} ref={dragRef}>
        <div
          ref={slideLineRef}
          className={styles.slideRightTime}
          onMouseDown={event => handleMouseDown(event, currentTime)}
          style={{ left: `${(currentTime / videoTotalTime) * 100}%` }}
        >
          <div className={styles.time}>
            {formatNumberToTime(parseInt(`${currentTime / 1000}`, 10))}
          </div>
          <div className={styles.sanjiao} />
          <div className={styles.slide} />
        </div>

        <div className={styles.slideRight}>
          <div className={styles['ruler-wrap']} ref={rulerRef} id="ruler" />
          <div className={styles.slidewarp1}>
            <Slider
              value={currentTime}
              tooltipVisible={false}
              onChange={e => {
                bindSetCurrentTime(e / 100);
              }}
              tipFormatter={value => {
                return null;
              }}
            />
          </div>
          <div className={styles.audioWarp} ref={audioDragRef}>
            <Drag
              totalTime={videoTotalTime}
              pauseVideo={pauseVideo}
              setOffset={setOffset}
              addAudioButtonShow={addAudioButtonShow}
            />

            <div
              className={styles.addAudioButton}
              style={{
                left: `${(currentTime / videoTotalTime) * 100}%`,
                display: addAudioButton ? 'block' : 'none',
              }}
              onClick={e => {
                setOffset(0);
                updateMusicStatus({
                  isModalVisible: true,
                  musicType: 'audio',
                  musicItem: null,
                  time: currentTime,
                });
              }}
            >
              + 添加配音
            </div>
            <Slider
              value={(currentTime / videoTotalTime) * 100}
              // marks={marks}
              onChange={e => {
                setOffset(0);
                bindSetCurrentTime(e / 100);
              }}
              tooltipVisible={false}
              tipFormatter={value => {
                return null;
              }}
            />
          </div>

          {BGMList?.length > 0 ? (
            <div
              ref={bgmDragRef}
              className={styles.bgmWarp}
              onMouseDown={event => {
                setOffset(0);
              }}
              onClick={event => {
                setOffset(event);
                pauseVideo();
                updateMusicStatus({
                  musicType: 'bgm',
                  musicItem: JSON.parse(JSON.stringify(BGMList))[0],
                });
              }}
            >
              <div className={styles.slidewarp5Img}>
                <div className={styles.name}>
                  <XiuIcon type="iconyinle" />
                  <span>{`${BGMList[0]?.rt_title}.mp3`} </span>
                </div>
                <Slider
                  // value={(currentTime / videoTotalTime) * 100}
                  // marks={marks}
                  tooltipVisible={false}
                  onChange={e => {
                    // bindSetCurrentTime(e / 100);
                  }}
                  tipFormatter={value => {
                    return null;
                  }}
                />
              </div>
            </div>
          ) : (
            <div className={styles.addBgmWarp} ref={bgmDragRef}>
              <div
                style={{
                  display: !isPlaying ? 'block' : 'none',
                  position: 'absolute',
                  left: `${(currentTime / videoTotalTime) * 100}%`,
                  top: '25%',
                  zIndex: 10,
                  fontSize: 12,
                  marginLeft: '27px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  updateMusicStatus({
                    isModalVisible: true,
                    musicType: 'bgm',
                    musicItem: null,
                    time: currentTime,
                  });
                }}
              >
                + 添加背景音乐
              </div>
              <Slider
                // value={(currentTime / videoTotalTime) * 100}
                tooltipVisible={false}
                onChange={e => {
                  // bindSetCurrentTime(e / 100);
                }}
                tipFormatter={value => {
                  return null;
                }}
              />
            </div>
          )}
        </div>
      </div>
      {offset !== 0 && <TrackPopover offset={offset} setOffset={setOffset} />}
      <SetupSoundModal />
      <AudioClips />
    </div>
  );
};

export default observer(BottomTrack);
