import { FC, useRef, useEffect } from 'react';
import { useReactive } from 'ahooks';
import { Slider, Tooltip } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import styles from './index.less';

interface Prop {
  preview: string;
}
const PlaySide: FC<Prop> = Props => {
  const { preview = '' } = Props;
  const state = useReactive({
    isPlaying: true,
    count: 10,
  });
  const videoRef = useRef<HTMLAudioElement>(null);

  const onChange = value => {
    console.log('onChange: ', value);
  };

  const onAfterChange = value => {
    console.log('onAfterChange: ', value);
  };
  const onCanPlay = () => {
    console.log('audio');
  };

  // 点击全局背景音乐
  const bindClickWhole = () => {
    console.log('全局背景音乐');
  };

  // 点击当前场景配乐
  const bindClickPresent = () => {
    console.log('当前场景配乐');
  };

  return (
    <div className={styles.playSideWarp}>
      <div className={styles.top}>
        <div className={styles.topleft}>【AI合成】未命名录音.MP3</div>
        <div className={styles.topright}>
          <div className={styles.toprightleft}>jian</div>
          <audio
            ref={videoRef}
            src={preview}
            loop={false}
            onCanPlay={onCanPlay}
          >
            糟糕了老铁，你的浏览器不支持audio,请尝试升级
          </audio>
          <Tooltip
            placement="rightTop"
            color="#ffffff"
            overlayInnerStyle={{
              color: ' #484E5F',
              fontSize: '12px',
              padding: '13px 19px 16px 19px',
              fontFamily: 'PingFangSC-Medium, PingFang SC',
              fontWeight: 500,
            }}
            title={
              <div className={styles.rightTooltipTitle}>
                <div className={styles.top} onClick={bindClickWhole}>
                  全局背景音乐
                </div>
                <div className={styles.bottom} onClick={bindClickPresent}>
                  当前场景配乐
                </div>
              </div>
            }
          >
            <div className={styles.toprightright}>添加</div>
          </Tooltip>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.bottomLeft}>
          <Tooltip title={state.isPlaying ? '暂停' : '播放'}>
            <XiuIcon type={state.isPlaying ? 'iconzanting' : 'iconbofang'} />
          </Tooltip>
        </div>
        <div className={styles.playSide}>
          <Slider
            value={state.count}
            onChange={onChange}
            onAfterChange={onAfterChange}
          />
        </div>
        <div className={styles.bottomRight}>01:08</div>
      </div>
    </div>
  );
};

export default PlaySide;
