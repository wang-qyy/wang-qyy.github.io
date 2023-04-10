import { HTMLAttributes } from 'react';
import classNames from 'classnames';
import { Tooltip } from 'antd';
import {
  PlusOutlined,
  PauseOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import { pauseVideo } from '@hc/editor-core';

import { formatNumberToTime, stopPropagation } from '@/utils/single';
import { XiuIcon } from '@/components';
import { useSetMusic, getNewAudioDuration } from '@/hooks/useSetMusic';

import styles from './index.less';

interface MusicInfo {
  title: string;
  total_time: number;
  preview: string;
  file_type: 'MP3';
  id: string;
}

interface MusicItemProps extends HTMLAttributes<HTMLDivElement> {
  data: MusicInfo;
  isCheck: boolean;
  bindPlay: (value: boolean) => void;
  isPlay: boolean;
}

/**
 * @param isCheck 选中状态
 * @param isPlay 播放状态
 * @function bindPlay 播放状态 处理函数
 * */
const MusicItem = (Props: MusicItemProps) => {
  const { data, isCheck, bindPlay, isPlay, className, ...others } = Props;
  const { title, total_time, preview, file_type, id } = data;
  const { bindAddAudio } = useSetMusic();

  // 更改音乐  添加或者替换
  const bindChangeBgm = (event: any) => {
    stopPropagation(event);

    const obj = {
      rt_title: title,
      resId: id,
      type: 2, // bgm:1  其他配乐:2
      rt_url: preview,
      // 音频出入场时间
      volume: 60,
      isLoop: false,
      // 音频时长
      rt_duration: total_time,
      fadeIn: 500,
      fadeOut: 500,
    };

    const duration = getNewAudioDuration(undefined, obj);

    bindAddAudio && bindAddAudio({ ...obj, ...duration });

    bindPlay(false);

    pauseVideo();
  };

  return (
    <div
      className={classNames(styles.musicItemWarp, className, {
        [styles.check]: isCheck,
      })}
      {...others}
    >
      <div className={styles.musicItemLeft}>
        <XiuIcon type="iconyinle1" />
      </div>
      <div className={styles.musicItemRight}>
        <div
          className={styles.musicItemRightTop}
        >{`${title}.${file_type}`}</div>
        <div className={styles.musicItemRightBottom}>
          {formatNumberToTime(parseInt(`${total_time / 1000}`, 10))}
        </div>
      </div>
      <div
        className={styles.musicItemPlay}
        onClick={event => {
          event.stopPropagation();
          bindPlay(!isPlay);
        }}
      >
        {isPlay ? <PauseOutlined /> : <CaretRightOutlined />}
      </div>

      <Tooltip
        overlayClassName="musicItemtooltip"
        title={<div className={styles.musicItemtooltipText}>添加</div>}
        color="#fcfcfc"
      >
        <div className={styles.musicItemAdd} onClick={bindChangeBgm}>
          <PlusOutlined />
        </div>
      </Tooltip>
    </div>
  );
};

export default MusicItem;
