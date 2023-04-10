import { useState, useRef, useEffect } from 'react';
import { Button, Progress, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { XiuIcon } from '@/components';
import classNames from 'classnames';
import { useUnmount } from 'ahooks';
import { clickActionWeblog } from '@/utils/webLog';
import NoTitleModal from '@/components/NoTitleModal';
import Maikefeng from '@/assets/image/maikefeng.png';
import styles from '../index.less';
import useAudioRecorder from '../hooks';

const RecorderCmp = (props: { onChange: () => void }) => {
  const { onChange } = props;
  const {
    time,
    formatTime,
    currentTime,
    formatCurrentTime,
    fileName,
    progress,
    isPlaying,
    status,
    statusInfo,
    changeStatus,
    beginAudio,
    saveAudio,
    reset,
    playRecorder,
    destroy,
  } = useAudioRecorder(onChange);
  const countInterval = useRef();

  const [countDown, setCountDown] = useState(3);
  // 结束倒计时 开始录制
  const endCountDown = () => {
    clearInterval(countInterval.current);
    beginAudio();
  };
  // 开启倒计时
  const startCountDown = () => {
    countInterval.current = setInterval(() => {
      setCountDown(t => t - 1);
    }, 1000);
  };
  const clickchangeStatus = () => {
    switch (status) {
      case 'ready': {
        changeStatus();
        startCountDown();
        // 点击开始录音埋点
        clickActionWeblog('mike_audio_002');
        break;
      }
      case 'recording': {
        changeStatus();
        break;
      }
      case 'recorded': {
        // 播放音频
        playRecorder();
        break;
      }
      case 'saved': {
        // 播放音频
        playRecorder();
        break;
      }
    }
  };
  // 重新录制
  const resetClick = () => {
    setCountDown(3);
    startCountDown();
    reset();
  };
  useEffect(() => {
    if (countDown <= 0) {
      endCountDown();
    }
    return () => {
      clearInterval();
    };
  }, [countDown]);
  // 销毁录音器
  useUnmount(() => {
    destroy();
  });
  return (
    <NoTitleModal
      className={styles.recorderModal}
      visible
      width={617}
      onCancel={() => {
        // 先销毁录音信息
        destroy();
        onChange();
      }}
      centered
      footer={null}
    >
      <div className={styles.soundTitle}>录音</div>
      {/* 左上角麦克风图片 */}
      <img src={Maikefeng} className={styles.soundBgImg} />
      {/* 录音操作区 */}
      <div className={styles.sound}>
        <div className={styles.soundItem}>
          <XiuIcon type="iconyinxiao" className={styles.soundItemIcon} />
          <XiuIcon type="iconyinxiao" className={styles.soundItemIcon} />
          <div className={styles.soundButtom} onClick={clickchangeStatus}>
            <div className={styles.soundButtomInner}>
              {/* ['recorded', 'saved'].includes(status) ? isPlaying ? 'iconzanting'
              : 'iconbofang' : 'iconrecord-sound' */}
              <XiuIcon
                className={statusInfo.className}
                type={isPlaying ? 'iconzanting' : statusInfo.icon}
              />
            </div>
          </div>
          <XiuIcon type="iconyinxiao" className={styles.soundItemIcon} />
          <XiuIcon type="iconyinxiao" className={styles.soundItemIcon} />
        </div>

        <div className={styles.soundRight}>
          <div className={styles.soundRightTip}>
            {status === 'countDown'
              ? `${statusInfo.showTxt}${countDown}`
              : statusInfo.showTxt}
          </div>
          <div className={styles.soundRightTime}>
            {/* 录音完成前 */}
            {['ready', 'countDown', 'recording'].includes(status) && (
              <>
                <span className={styles.primary}>{formatTime}</span>
                /00:10:00
              </>
            )}
            {/* 录音完成后 */}
            {['recorded', 'saved'].includes(status) && (
              <>
                <span className={styles.primary}>{formatCurrentTime}</span> /
                {formatTime}
              </>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className={styles.soundItem}>
          {/* 录音中.. */}
          {status === 'recording' && (
            <Button
              type="primary"
              className={styles.soundButtonOver}
              onClick={clickchangeStatus}
            >
              结束录音
            </Button>
          )}
          {/* 录制完.. */}
          {status === 'recorded' && (
            <>
              <Button
                icon={<XiuIcon type="icondui" />}
                type="primary"
                className={styles.soundButtonOver}
                onClick={saveAudio}
              >
                确定完成
              </Button>
              <Button
                className={styles.soundButtonReset}
                onClick={resetClick}
                icon={<XiuIcon type="iconzhongzhi" />}
              >
                重新录制
              </Button>
            </>
          )}
          {/* 待添加.. */}
          {status === 'saved' && (
            <Button
              type="primary"
              className={styles.soundButtonOver}
              onClick={changeStatus}
            >
              确认
            </Button>
          )}
        </div>
        {/* <div
          className={styles.closeIcon}
          onClick={() => {
            // 先销毁录音信息
            destroy();
            onChange();
          }}
        >
          <CloseOutlined />
        </div> */}
        {/* 上传进度 */}
        {status === 'uploading' && (
          <div className={styles.uploadProgress}>
            <div className={styles.uploadProgressRow}>
              <div className={styles.uploadProgressTxt}>
                【录音】{fileName}.MP3
              </div>
              <div className={styles.uploadProgressTip}>上传中…{progress}%</div>
            </div>
            <div className={styles.uploadProgressRow}>
              <Progress percent={progress} />
            </div>
          </div>
        )}
      </div>
    </NoTitleModal>
  );
};

export default RecorderCmp;
