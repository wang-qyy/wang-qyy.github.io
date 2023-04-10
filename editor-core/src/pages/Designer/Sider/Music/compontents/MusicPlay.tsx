import { useRef, useState, useEffect, memo } from 'react';
import { Progress } from 'antd';
import {
  CloseOutlined,
  PauseOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import { formatNumberToTime } from '@/utils/single';
import { XiuIcon } from '@/components';

import styles from './index.less';

const MusicPlay = (Props: {
  data: any;
  bindPlay: (value: boolean) => void;
  isPlay: boolean;
  onCancel: () => void;
}) => {
  const { data, bindPlay, isPlay, onCancel } = Props;
  const audioRef = useRef<HTMLAudioElement>(null);
  const playRef = useRef<HTMLAudioElement | null>(null);

  const [time, setTime] = useState(-1);
  const { title, total_time, file_type } = data;

  // 音频加载完成后的一系列操作
  const rt_duration = () => {
    setTime(0);
    playRef.current = audioRef?.current;
    if (playRef.current != null) {
      playRef.current.currentTime = 0; // 默认指定音频默认时间开始播放（默认时间为s）
      // currentTime 属性设置或返回音频/视频播放的当前位置（以秒计）。
      // 当设置该属性时，播放会跳跃到指定的位置。
      playRef.current.play();
      playRef.current.ontimeupdate = () => {
        // rt_duration 属性返回当前音频的长度，以秒计。
        if (playRef.current?.currentTime) {
          if (
            parseInt(`${playRef.current.currentTime}`, 10) <
            parseInt(`${total_time / 1000}`, 10)
          ) {
            setTime(playRef.current?.currentTime);
          } else {
            playRef.current.ontimeupdate = null;
            setTime(0);
            // audioRef?.current?.pause();
            bindPlay(false);
          }
        }
      };
    }
  };
  useEffect(() => {
    rt_duration();
    return () => {
      if (playRef.current) {
        playRef.current.ontimeupdate = null;
      }
    };
  }, [data]);

  useEffect(() => {
    if (playRef.current) {
      if (isPlay) {
        if (time === 0) {
          rt_duration();
        }
        playRef.current.play();
      } else {
        playRef.current.pause();
      }
    }
  }, [isPlay]);

  return (
    <div className={styles.musicPlayWarp}>
      <audio ref={audioRef} src={data.preview} loop={false}>
        糟糕了老铁，你的浏览器不支持audio,请尝试升级
      </audio>
      <div className={styles.musicPlayLeft}>
        <XiuIcon type="iconyinle1" />
        <div
          className={styles.musicItemPlay}
          onClick={event => {
            event.stopPropagation();
            bindPlay(!isPlay);
          }}
        >
          {isPlay ? <PauseOutlined /> : <CaretRightOutlined />}
        </div>
      </div>
      <div className={styles.musicPlayContent}>
        <div
          className={styles.musicPlayContentTop}
        >{`${title}.${file_type}`}</div>
        <div className={styles.musicPlayContentBottom}>
          <div className={styles.musicPlayStatTime}>
            {formatNumberToTime(parseInt(`${time}`, 10))}
          </div>
          <div className={styles.shuxian} />
          <div className={styles.musicPlayEndtime}>
            {formatNumberToTime(parseInt(`${total_time / 1000}`, 10))}
          </div>
          <div className={styles.musicPlayProgress}>
            <Progress percent={(time * 100000) / total_time} showInfo={false} />
          </div>
        </div>
      </div>

      <div className={styles.musicPlayClose} onClick={onCancel}>
        <CloseOutlined />
      </div>
    </div>
  );
};

export default memo(MusicPlay);
