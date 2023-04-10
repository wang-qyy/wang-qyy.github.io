import { useRef, useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import { useMusicStatus } from '@/store/adapter/useMusicStatus';
import { PlayCircleFilled, PauseCircleFilled } from '@ant-design/icons';
import { formatNumberToTime } from '@/utils/single';
import { useSetMusic } from '@/hooks/useSetMusic';
import ClipSide from '@/components/MusicSide/clipSide';
import { useDebounceFn } from 'ahooks';
import styles from './index.less';

const AudioClips = () => {
  const [sliderValue, setSliderValue] = useState([0, 100]);
  const [isPlay, setIsPlay] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { musicStatus, updateMusicStatus } = useMusicStatus();
  const { audioClipsVisible } = musicStatus;
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioLineRef = useRef<HTMLAudioElement>(null);
  const { bindSetAudioCut, bindSetAudioDuration } = useSetMusic();

  const { musicItem } = musicStatus;
  const rtDuration =
    musicItem?.cut?.length > 1
      ? musicItem?.cut[1] - musicItem?.cut[0]
      : musicItem?.rt_duration;

  const handleOk = () => {
    updateMusicStatus({ audioClipsVisible: false });
    setIsPlay(false);
  };

  const handleCancel = () => {
    updateMusicStatus({ audioClipsVisible: false });
    setIsPlay(false);
  };

  const onCanPlay = () => {};

  const { run } = useDebounceFn(
    () => {
      message.info('视频长度不能小于1秒');
    },
    { wait: 500 },
  );

  const bindSliderChange = (value: Array<number>) => {
    audioRef?.current?.pause();
    setIsPlay(false);
    // 判断顶部时间是否重叠，重叠则打开展示
    if (((value[1] - value[0]) / 100) * 506 <= 65) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }

    if ((value[1] - value[0]) * rtDuration <= 100000) {
      run();
    } else {
      setSliderValue(value);
    }
  };

  // 音频加载完成后的一系列操作
  const rt_duration = () => {
    const myVid = audioRef?.current;
    const cutStart = musicItem?.cut?.length > 1 ? musicItem?.cut[0] * 100 : 0;

    if (myVid != null) {
      const startT = (sliderValue[0] * rtDuration + cutStart) / 100000;
      const endT = (sliderValue[1] * rtDuration + cutStart) / 100000;

      myVid.currentTime = startT; // 默认指定音频默认时间开始播放（默认时间为s）
      // currentTime 属性设置或返回音频/视频播放的当前位置（以秒计）。
      // 当设置该属性时，播放会跳跃到指定的位置。
      myVid.play();
      myVid.ontimeupdate = () => {
        // rt_duration 属性返回当前音频的长度，以秒计。
        const AudioClipsLine = audioLineRef.current;
        if (myVid?.currentTime >= endT) {
          setIsPlay(false);
          myVid?.pause();
          return;
        }
        if (AudioClipsLine) {
          AudioClipsLine.style.left = `${
            ((myVid.currentTime - startT) / (rtDuration / 1000)) * 100 +
            sliderValue[0]
          }%`;
        }
      };
    }
  };

  const submit = () => {
    const cutStart = musicItem?.cut?.length > 1 ? musicItem?.cut[0] : 0;
    const time = {
      startTime: (sliderValue[0] * rtDuration) / 100 + cutStart,
      endTime: (sliderValue[1] * rtDuration) / 100 + cutStart,
    };
    const endTime =
      musicItem.startTime +
        ((sliderValue[1] - sliderValue[0]) * rtDuration) / 100 <
      musicItem.endTime
        ? musicItem.startTime +
          ((sliderValue[1] - sliderValue[0]) * rtDuration) / 100
        : musicItem.endTime;
    const duration = {
      startTime: musicItem.startTime,
      endTime,
    };
    bindSetAudioCut(time, musicItem?.rt_id);
    bindSetAudioDuration(duration, musicItem?.rt_id);
    handleOk();
  };

  useEffect(() => {
    if (isPlay) {
      rt_duration();
    } else {
      audioRef?.current?.pause();
    }
  }, [isPlay]);

  useEffect(() => {
    const arr = [0, 100];
    // const cutArr = musicItem?.cut;
    // if (cutArr) {
    //   arr = [(cutArr[0] / rtDuration) * 100, (cutArr[1] / rtDuration) * 100];
    // } else {
    //   arr = [0, 100];
    // }

    setSliderValue(arr);
  }, [musicItem]);

  return (
    <Modal
      visible={audioClipsVisible}
      footer={null}
      onOk={handleOk}
      onCancel={handleCancel}
      bodyStyle={{ padding: 0 }}
      width={667}
      getContainer={document.getElementById('xiudodo')}
    >
      <div className={styles.audioClips}>
        <div className={styles.audioClipsTitle}>音频裁剪</div>
        <div className={styles.audioClipsName}>
          {RegExp(/mp3/).test(musicItem?.rt_title)
            ? musicItem?.rt_title
            : `${musicItem?.rt_title}.mp3`}
        </div>
        <div className={styles.audioClipsContent}>
          {isPlay ? (
            <PauseCircleFilled
              style={{ fontSize: '27px' }}
              onClick={() => {
                setIsPlay(false);
              }}
            />
          ) : (
            <PlayCircleFilled
              style={{ fontSize: '27px' }}
              onClick={() => {
                setIsPlay(true);
              }}
            />
          )}
          <div className={styles.audioClipsClip}>
            <audio
              id="videoDiv"
              ref={audioRef}
              loop={false}
              src={musicItem?.rt_url}
              onCanPlay={onCanPlay}
            >
              糟糕了老铁，你的浏览器不支持audio,请尝试升级
            </audio>
            <ClipSide
              style={{ height: '38px' }}
              sliderValue={sliderValue}
              bindSliderChange={bindSliderChange}
            />
            <div
              id="audioClipsLine"
              ref={audioLineRef}
              className={styles.audioClipsLine}
              style={{ left: `${sliderValue[0]}%` }}
            />
            <div
              id="audioClipsClipLeft"
              className={styles.audioClipsClipLeft}
              style={{
                left: `${isOpen ? sliderValue[0] - 5.4 : sliderValue[0]}%`,
              }}
            >
              {formatNumberToTime(
                parseInt(`${(rtDuration * sliderValue[0]) / 100000}`, 10),
              )}
            </div>
            <div
              id="audioClipsClipRight"
              className={styles.audioClipsClipRight}
              style={{
                right: `${
                  isOpen ? 100 - sliderValue[1] - 5.4 : 100 - sliderValue[1]
                }%`,
              }}
            >
              {formatNumberToTime(
                parseInt(`${(rtDuration * sliderValue[1]) / 100000}`, 10),
              )}
            </div>
          </div>
        </div>
        <div className={styles.audioClipsFooter}>
          <div
            className={styles.audioClipsFooterLeft}
            onClick={() => {
              handleCancel();
            }}
          >
            取消
          </div>
          <div className={styles.audioClipsFooterRight} onClick={submit}>
            提交
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AudioClips;
