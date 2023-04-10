import React, { useState } from 'react';
import { Modal, Button, Input, Spin } from 'antd';

import {
  PlayCircleFilled,
  PauseCircleFilled,
  WifiOutlined,
} from '@ant-design/icons';
import { useMusicStatus } from '@/store/adapter/useMusicStatus';
import OverwriteSlider from '@/components/OverwriteSlider';
import styles from './index.less';

const { TextArea } = Input;

const TextToSpeech = () => {
  const [spinning, setSpinning] = useState(false);
  const { musicStatus, updateMusicStatus } = useMusicStatus();
  const { textToSpeechVisible } = musicStatus;

  const showModal = () => {
    updateMusicStatus({ textToSpeechVisible: true });
  };

  const handleOk = () => {
    updateMusicStatus({ textToSpeechVisible: false });
  };

  const handleCancel = () => {
    updateMusicStatus({ textToSpeechVisible: false });
  };

  const roleArr = [
    { id: '1', value: '通用男生' },
    { id: '2', value: '通用男生' },
    { id: '3', value: '通用男生' },
    { id: '4', value: '通用男生' },
    { id: '5', value: '通用男生' },
    { id: '6', value: '通用男生' },
    { id: '7', value: '通用男生' },
    { id: '8', value: '通用男生' },
  ];

  // 点击提交
  const binClickOK = () => {
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
    }, 2000);
  };
  return (
    <Modal
      visible={textToSpeechVisible}
      footer={null}
      onOk={handleOk}
      onCancel={handleCancel}
      bodyStyle={{ padding: 0 }}
      width={381}
      getContainer={document.getElementById('xiudodo')}
    >
      <Spin spinning={spinning} tip="Loading...">
        <div className={styles.textToSpeechModal}>
          <div className={styles.textToSpeechTitle}>AI文字转语音</div>
          <div className={styles.textToSpeechTextArea}>
            <TextArea placeholder="输入需要转换的文字" />
          </div>

          <div className={styles.textToSpeechRole}>
            <div className={styles.textToSpeechRoleTitle}>角色：</div>
            <div className={styles.textToSpeechRoleContent}>
              {roleArr.map(item => {
                return (
                  <div
                    className={styles.textToSpeechRoleContentItem}
                    key={item.id}
                  >
                    {item.value}
                  </div>
                );
              })}
            </div>
            <div className={styles.textToSpeechSlider}>
              <div className={styles.textToSpeechSliderTitle}>语速</div>
              <div className={styles.textToSpeechSliderBottom}>
                <OverwriteSlider
                  onChange={(volume: number) => {}}
                  value={30}
                  tooltipVisible={false}
                />
                <span>{30}</span>
              </div>
            </div>
            <div className={styles.textToSpeechSlider}>
              <div className={styles.textToSpeechSliderTitle}>声音</div>
              <div className={styles.textToSpeechSliderBottom}>
                <OverwriteSlider
                  onChange={(volume: number) => {
                    console.log(volume);
                  }}
                  value={30}
                  tooltipVisible={false}
                />
                <span>{30}</span>
              </div>
            </div>

            <div className={styles.audition}>
              <div className={styles.auditionTitle}>试听</div>
              <div className={styles.auditionBottom}>
                <div className={styles.auditionBottomLeft}>
                  <PlayCircleFilled />
                  {/* <PauseCircleFilled /> */}
                </div>
                <div className={styles.auditionBottomRight}>
                  <div className={styles.auditionBottomRightRight} />
                  <WifiOutlined rotate={90} />
                  <span className={styles.rightTime}>0:05s</span>
                </div>
              </div>
            </div>

            <div className={styles.textToSpeechButton} onClick={binClickOK}>
              确认转化
            </div>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default TextToSpeech;
