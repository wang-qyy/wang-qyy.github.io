import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import { useMusicStatus } from '@/store/adapter/useMusicStatus';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import styles from './index.less';
import MyMusic from './MyMusic';
import CloudsMusic from './CloudsMusic';

const SetupSoundModal = () => {
  const [tabKey, setTabKey] = useState('cloudsMusic');

  const { musicStatus, updateMusicStatus } = useMusicStatus();
  const { isModalVisible } = musicStatus;
  const { checkLoginStatus } = useCheckLoginStatus();

  const handleOk = () => {
    updateMusicStatus({ isModalVisible: false });
  };

  const handleCancel = () => {
    updateMusicStatus({ isModalVisible: false });
  };

  return (
    <>
      {isModalVisible && (
        <Modal
          visible={isModalVisible}
          footer={null}
          onOk={handleOk}
          onCancel={handleCancel}
          bodyStyle={{ padding: 0 }}
          width={905}
          getContainer={document.getElementById('xiudodo')}
        >
          <div className={styles.SetupSoundModal}>
            <div className={styles.left}>
              <div
                className={styles.leftTop}
                style={
                  tabKey === 'cloudsMusic'
                    ? { background: ' #ffffff', color: '#5A4CDB' }
                    : {}
                }
                onClick={() => {
                  setTabKey('cloudsMusic');
                }}
              >
                云端音乐
              </div>
              <div
                className={styles.leftBottom}
                style={
                  tabKey === 'myMusic'
                    ? { background: '#ffffff', color: '#5A4CDB' }
                    : {}
                }
                onClick={e => {
                  const loginStatus = checkLoginStatus();
                  if (loginStatus) {
                    e.stopPropagation();
                  } else {
                    setTabKey('myMusic');
                  }
                }}
              >
                本地音乐
              </div>
            </div>
            <div className={styles.right}>
              {tabKey === 'myMusic' ? <MyMusic /> : <CloudsMusic />}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default SetupSoundModal;
