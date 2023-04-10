import React, { FC, useRef, useState } from 'react';
import { useMusicStatus } from '@/store/adapter/useMusicStatus';
import { XiuIcon } from '@/components';
import { observer } from '@hc/editor-core';
import { useSetMusic } from '@/hooks/useSetMusic';
import classNames from 'classnames';
import { useClickAway } from 'ahooks';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { mouseMoveDistance, stopPropagation } from '@/utils/single';
import styles from './index.less';

interface Prop {
  totalTime: number;
  audioList: any;
  pauseVideo: () => void;
  addAudioButtonShow: () => void;
  setOffset: (value: any) => void;
}

const Drag: FC<Prop> = Props => {
  const { audioList } = useSetMusic();

  const { totalTime, pauseVideo, setOffset, addAudioButtonShow } = Props;
  const { updateMusicStatus } = useMusicStatus(); // store存储信息
  const { bindSetAudioDuration } = useSetMusic();
  const [rtId, setRtId] = useState(0); // 存储当前准备拖动配乐id

  const dragRef = useRef(null);

  useClickAway(() => {
    setRtId(0);
  }, dragRef);
  // 拖动结束发送当前位置信息给内核

  const bingStorage = (type: string, item: any, value: number) => {
    if (value === 0) return;

    addAudioButtonShow();

    const obj = JSON.parse(JSON.stringify(item));
    const time = Math.round(value * totalTime);
    switch (type) {
      case 'left':
        obj.startTime += time;
        bindSetAudioDuration(obj, item.rt_id);
        break;
      case 'right':
        obj.endTime += time;
        bindSetAudioDuration(obj, item.rt_id);
        break;
      default:
        obj.startTime += time;
        obj.endTime += time;
        bindSetAudioDuration(obj, item.rt_id);
        break;
    }
  };

  // 拖动整个配乐
  const bodilyMovement = (
    item: { endTime: number; startTime: number; rt_id: number },
    index: number,
    value: number,
  ) => {
    const startTimeNext = audioList[index - 1]
      ? audioList[index - 1].endTime
      : 0;

    const endTimeNext =
      audioList[index + 1] && audioList[index + 1]?.startTime < totalTime
        ? audioList[index + 1]?.startTime
        : totalTime;
    if (
      item.startTime + value * totalTime > startTimeNext &&
      item.endTime + value * totalTime < endTimeNext
    ) {
      bingStorage('content', item, value);
    }
  };

  // 左边移动
  const leftMovement = (
    item: { endTime: number; startTime: number; rt_id: number },
    index: number,
    value: number,
  ) => {
    const startTimeNext = audioList[index - 1]
      ? audioList[index - 1].endTime
      : 0;
    const cut =
      audioList[index]?.cut?.length > 1 &&
      audioList[index]?.cut[1] - audioList[index]?.cut[0];
    if (cut) {
      if (item.startTime + value * totalTime < item.endTime - cut) {
        return;
      }
    }

    if (
      item.startTime + value * totalTime >= startTimeNext &&
      item.startTime + value * totalTime < item.endTime - 1000
    ) {
      bingStorage('left', item, value);
    }
  };

  // 右边移动
  const rightMovement = (
    item: { endTime: number; startTime: number; rt_id: number },
    index: number,
    value: number,
  ) => {
    const endTimeNext =
      audioList[index + 1] && audioList[index + 1]?.startTime < totalTime
        ? audioList[index + 1]?.startTime
        : totalTime;
    const cut =
      audioList[index]?.cut?.length > 1 &&
      audioList[index]?.cut[1] - audioList[index]?.cut[0];

    if (cut) {
      if (item.endTime + value * totalTime > item.startTime + cut) {
        return;
      }
    }
    if (
      item.endTime + value * totalTime > item.startTime + 1000 &&
      item.endTime + value * totalTime < endTimeNext
    ) {
      bingStorage('right', item, value);
    }
  };
  //
  const bindSildValue = (
    val: number,
    type: string,
    item: any,
    index: number,
  ) => {
    switch (type) {
      case 'left':
        leftMovement(item, index, val);
        break;
      case 'right':
        rightMovement(item, index, val);
        break;
      default:
        bodilyMovement(item, index, val);
        break;
    }
  };

  const winWidth = dragRef?.current?.offsetWidth || 1033;
  const bindMouseDown = (event: any, i: any, type: string, index: number) => {
    event.preventDefault();
    stopPropagation(event);
    setRtId(i.rt_id);
    setOffset(0);
    if (pauseVideo) {
      pauseVideo();
    }
    mouseMoveDistance(event, distance => {
      bindSildValue(Number((distance / winWidth).toFixed(4)), type, i, index);
    });
  };

  // console.log('audioList', audioList);

  return (
    <div className={styles.drag} ref={dragRef}>
      {audioList?.map((item: any, index: number) => {
        return (
          <div
            key={item.rt_id}
            style={{
              width: `${((item.endTime - item.startTime) / totalTime) * 100}%`,
              left: `${(item.startTime / totalTime) * 100}%`,
            }}
            onClick={event => {
              setOffset(event);
              updateMusicStatus({
                musicType: 'audio',
                musicItem: JSON.parse(JSON.stringify(item)),
              });
            }}
          >
            <div
              id={`Left${item.rt_id}`}
              onMouseDown={event => bindMouseDown(event, item, 'left', index)}
              className={classNames(styles.dragLeft, {
                [styles.dragLeftactive]: item.rt_id === rtId,
              })}
              style={{
                left: `${(item.startTime / totalTime) * 100}%`,
              }}
            >
              <LeftOutlined />
            </div>
            <div
              id={`Right${item.rt_id}`}
              onMouseDown={event => bindMouseDown(event, item, 'right', index)}
              className={classNames(styles.dragRight, {
                [styles.dragRightactive]: item.rt_id === rtId,
              })}
              style={{
                right: `${((totalTime - item.endTime) / totalTime) * 100}%`,
              }}
            >
              <RightOutlined />
            </div>

            <div
              onMouseDown={event => {
                bindMouseDown(event, item, 'content', index);
              }}
              className={classNames(styles.dragItem, {
                [styles.active]: item.rt_id === rtId,
              })}
              id={`Content${item.rt_id}`}
              style={{
                width: `${
                  ((item.endTime - item.startTime) / totalTime) * 100
                }%`,
                left: `${(item.startTime / totalTime) * 100}%`,
              }}
            >
              <div className={styles.dragItemWarp}>
                <div className={styles.dragItemIcon}>
                  <XiuIcon type="iconyinle" />
                </div>
                <div
                  className={styles.dragItemName}
                >{`${item.rt_title}.mp3`}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default observer(Drag);
