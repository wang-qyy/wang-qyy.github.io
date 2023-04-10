import React, { useState, memo, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { Modal, message } from 'antd';
import './index.less';
import { bindPh } from '@/api/watermark';
import { getUserInfo } from '@/api/user';
import { useUserBindPhoneModal } from '@/store/adapter/useGlobalStatus';
import { useUserInfoSetter } from '@/store/adapter/useUserInfo';
import LoginPanel from './loginModal';
import BindResultModal from './BindResultModal';

function Index(props: any) {
  const { phoneBindingShow, setPhoneBindingShow, loginCallback } = props;
  const { bindPhoneModal, closeBindPhoneModal } = useUserBindPhoneModal();
  const updateUserInfo = useUserInfoSetter();
  const [bindResult, setBindResult] = useState(null);
  function closeModal(sign: boolean) {
    setPhoneBindingShow && setPhoneBindingShow(sign);
    closeBindPhoneModal();
  }

  const getInfo = useRequest(getUserInfo, {
    manual: true,
    onSuccess: userInfo => {
      updateUserInfo(userInfo);
    },
    onError: res => {
      console.log(res);
    },
  });
  function callback(status: boolean) {
    if (status) {
      loginCallback && loginCallback();
      getInfo.run();
      closeModal(false);
    } else {
      closeModal(false);
    }
  }

  const bindChange = () => {
    bindPh({
      phoneNum: bindResult?.phoneNum,
      phoneMsgNum: bindResult?.phoneMsgNum,
      confirm_bind: 1,
    }).then(res => {
      if (res?.code === 0) {
        callback(true);
        setBindResult(null);
        message.success(`绑定成功`);
      } else {
        // message.error(`${res?.data?.msg}`);
      }
    });
  };
  return (
    <>
      <Modal
        footer={null}
        destroyOnClose
        className="no-title-modal"
        title={null}
        centered
        visible={bindPhoneModal ?? phoneBindingShow}
        onCancel={() => {
          closeModal(false);
        }}
        width={413}
      >
        <LoginPanel loginCallback={callback} setBindResult={setBindResult} />
      </Modal>
      <BindResultModal
        bindResult={bindResult}
        setBindResult={setBindResult}
        bindChange={bindChange}
      />
    </>
  );
}

export default memo(Index);
