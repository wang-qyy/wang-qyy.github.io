import { Modal } from 'antd';
import { useState, useEffect, useRef } from 'react';
import {
  useUserLoginModal,
  useUserCheckerStatus,
} from '@/store/adapter/useGlobalStatus';

import { useUserInfo, useUserInfoSetter } from '@/store/adapter/useUserInfo';
import { handleSave } from '@/utils/userSave';

import getUrlParams from '@/utils/urlProps';
import LoginModal from './loginModal';

const Index = () => {
  // const [showLogin, setShowLogin] = useState(true);
  const { startLoop, closeLoginAlert, closeReLoginTips } =
    useUserCheckerStatus();
  const { loginModal, closeLoginModal } = useUserLoginModal();
  const updateUserInfo = useUserInfoSetter();
  const xiuInterface: any = useRef();

  const generateTokenItem = (key: string | number) => {
    return (window as any).xiuLib
      ?.md5(`brhe7HJ943hfjkdsbcKNQYIUV78hjkuyeqwaBH87${key}`)
      .substring(0, 8);
  };

  const getToken = () => {
    return `${generateTokenItem(~~(Date.now() / 6000))}+${generateTokenItem(
      ~~(Date.now() / 6000) + 1,
    )}`;
  };

  function loginCallback(status: boolean, userInfo: any) {
    if (status) {
      updateUserInfo(userInfo);
      closeLoginModal();
      closeLoginAlert();
      startLoop();
      closeReLoginTips();
      if (getUrlParams().redirect !== 'watermark') {
        handleSave({ isChecked: true });
      }
      xiuInterface.current?.ipcRenderer.sendToHost('loggedIn');
    }
  }

  useEffect(() => {
    xiuInterface.current = (window as any).getXiuInterface?.(getToken());
  }, []);

  return (
    <Modal
      footer={null}
      destroyOnClose
      className="no-title-modal"
      title={null}
      style={{ top: '25%' }}
      visible={loginModal}
      onCancel={() => {
        xiuInterface.current?.ipcRenderer.sendToHost('closeNewTab');
        closeLoginModal();
      }}
      width={638}
      getContainer={document.getElementById('xiudodo')}
    >
      <LoginModal
        loginCallback={loginCallback}
        closeLoginModal={closeLoginModal}
      />
    </Modal>
  );
};

export default Index;
