import React, { useEffect, useState } from 'react';
import { Slider } from 'antd';
import { useMusicStatus } from '@/store/adapter/useMusicStatus';
import { XiuIcon } from '@/components';

import { useSetMusic } from '@/hooks/useSetMusic';
import styles from './index.less';

const TrackPopover = (Props: any) => {
  const { offset, setOffset } = Props;
  const { musicStatus, updateMusicStatus } = useMusicStatus();
  const { musicItem } = musicStatus;
  const { bindRemoveAudio, bindSetVolume } = useSetMusic();
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(musicItem?.volume);
  }, [musicItem]);

  return (
    <div
      className={styles.backgroundMusicPopover}
      style={{
        left: `${offset.clientX}px`,
        top: `${offset.clientY}px`,
      }}
    >
      <div className={styles.backgroundMusicPopoverTop}>
        <div
          className={styles.backgroundMusicPopoverButton}
          onClick={() => {
            updateMusicStatus({ isModalVisible: true });
          }}
        >
          替换
        </div>
        <div
          className={styles.backgroundMusicPopoverButton}
          onClick={() => {
            updateMusicStatus({ audioClipsVisible: true });
          }}
        >
          裁剪
        </div>
        <div
          className={styles.backgroundMusicPopoverButton}
          onClick={() => {
            updateMusicStatus({
              musicType: 'bgm',
              musicItem: null,
            });
            bindRemoveAudio(musicItem?.rt_id);
            setOffset(0);
          }}
        >
          删除
        </div>
      </div>

      <div className={styles.backgroundMusicPopoverBottom}>
        <div className={styles.backgroundMusicPopoverBottomLeft}>
          <XiuIcon type="iconshengyin" />
        </div>
        <div
          className={styles.backgroundMusicPopoverBottomRight}
          onClick={event => {
            // event.preventDefault();
            event.stopPropagation();
          }}
        >
          <Slider
            value={value}
            tooltipVisible={false}
            onChange={e => {
              setValue(e);
              bindSetVolume(e, musicItem?.rt_id);
            }}
            tipFormatter={value => {
              return null;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TrackPopover;
