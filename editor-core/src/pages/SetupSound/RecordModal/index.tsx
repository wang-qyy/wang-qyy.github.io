import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'antd';
import {
  PlayCircleFilled,
  PauseCircleFilled,
  WifiOutlined,
} from '@ant-design/icons';
import Recorder from 'js-audio-recorder';
import { useMusicStatus } from '@/store/adapter/useMusicStatus';
import styles from './index.less';

const recorder = new Recorder();

const RecordModal = () => {
  const [recordingState, setRecordingState] = useState(false);
  const [recordState, setRecordState] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false); // 警告弹框
  const [time, setTime] = useState(0);
  const { musicStatus, updateMusicStatus } = useMusicStatus();
  const { recordModalVisible } = musicStatus;
  const showModal = () => {
    updateMusicStatus({ recordModalVisible: true });
  };

  const handleOk = () => {
    updateMusicStatus({ recordModalVisible: false });
  };

  const handleCancel = () => {
    updateMusicStatus({ recordModalVisible: false });
  };

  const handleModalOk = () => {
    setWarnVisible(false);
  };

  const handleModalCancel = () => {
    setWarnVisible(false);
  };

  //   // 开始录音
  // recorder.start();
  // // 暂停录音
  // recorder.pause();
  // // 继续录音
  // recorder.resume()
  // // 结束录音
  // recorder.stop();
  // // 录音播放
  // recorder.play();
  // // 销毁录音实例，释放资源，fn为回调函数，
  // recorder.destroy(fn);
  // recorder = null;

  // 获取 PCM 数据(Blob)
  // recorder.getPCMBlob();
  // // 获取 WAV 数据(Blob)
  // recorder.getWAVBlob();

  const recorderDestroy = () => {
    recorder.stop();
    const blob = recorder.getPCMBlob();
    const blob2 = recorder.getWAVBlob();
    console.log('blob', blob, 'blob2', blob2);
    setRecordingState(true);
    setTime(recorder.duration);
    console.log(recorder.duration);
    // 下载pcm文件
    recorder.downloadPCM();
    // 下载wav文件
    recorder.downloadWAV();
  };

  // 判断是否授权
  const impower = () => {
    if (navigator.mediaDevices.getUserMedia) {
      const constraints = { audio: true };
      navigator.mediaDevices.getUserMedia(constraints).then(
        stream => {
          console.log('授权成功！');
          !recordState ? recorder.start() : recorderDestroy();
          setRecordState(!recordState);
        },
        () => {
          console.error('授权失败！');
          setWarnVisible(true);
        },
      );
    } else {
      console.error('浏览器不支持 getUserMedia');
    }
  };

  const binClickRecord = () => {
    impower();
  };

  const bidClickSubmit = () => {
    recorder.destroy();
  };

  const bindClickPay = () => {
    console.log('bofang');
    recorder.play();
  };

  return (
    <Modal
      visible={recordModalVisible}
      footer={null}
      onOk={handleOk}
      onCancel={handleCancel}
      bodyStyle={{ padding: 0 }}
      width={518}
      getContainer={document.getElementById('xiudodo')}
    >
      {!recordingState ? (
        <div className={styles.RecordModal}>
          <div className={styles.RecordModalTitle}>录音</div>
          <div className={styles.RecordModalContent}>暂无音频</div>
          <div className={styles.RecordModalFooter}>
            <div
              className={
                recordState
                  ? styles.RecordModalFooterTop1
                  : styles.RecordModalFooterTop
              }
              onClick={() => binClickRecord()}
            />

            <div className={styles.RecordModalFooterBottom}>长按开始录音</div>
          </div>
        </div>
      ) : (
        <div className={styles.RecordModal}>
          <div className={styles.RecordModalTop}>
            <div className={styles.auditionBottom}>
              <div className={styles.auditionBottomLeft} onClick={bindClickPay}>
                <PlayCircleFilled />
                {/* <PauseCircleFilled /> */}
              </div>
              <div className={styles.auditionBottomRight}>
                <div className={styles.auditionBottomRightRight} />
                <WifiOutlined rotate={90} />
                <span className={styles.rightTime}>{time}s</span>
                <span className={styles.rightName}>录音1</span>
              </div>
            </div>
            <div className={styles.RecordModalTopRight}>删除</div>
          </div>
          <div className={styles.RecordModalBottom} onClick={bidClickSubmit}>
            提交
          </div>
        </div>
      )}
      <Modal
        visible={warnVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={false}
        getContainer={document.getElementById('xiudodo')}
      >
        <p>我们无法访问您的麦克风进行录制,您需要通过浏览器启用权限</p>
        <button>好的</button>
      </Modal>
    </Modal>
  );
};

export default RecordModal;
