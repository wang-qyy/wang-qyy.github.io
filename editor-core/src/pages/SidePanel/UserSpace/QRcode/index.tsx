/* eslint-disable react/no-unused-prop-types */
import { PropsWithChildren, useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { Popover } from 'antd';

import { useRequest, useSetState } from 'ahooks';
import { getPhoneUploadQRcodeV2, checkPhoneUploadQRcode } from '@/api/pictures';
import { useCheckLoginStatus } from '@/hooks/loginChecker';

import { getUserInfo } from '@/store/adapter/useUserInfo';

import PhoneBinding from '@/pages/GlobalMobal/PhoneBinding';

import { useLeftSideInfo, useUserBindPhoneModal } from '@/store/adapter/useGlobalStatus';

import styles from './index.less';

interface props {
  folderId: string;
  onSuccess: () => void;
}
const QRcode = ({ folderId, onSuccess }: props) => {
  const { leftSideInfo } = useLeftSideInfo();

  const submenu = leftSideInfo.submenu?.split('/') || [];

  const [state, setState] = useSetState({
    time: null,
    status: false,
  });

  // 轮询上传状态
  const checkUploadStatus = useRequest(checkPhoneUploadQRcode, {
    manual: true,
    pollingInterval: 2000,
    // pollingWhenHidden: false,
    onSuccess: res => {
      if (res.last_upload_time !== state.time) {
        setState({
          status: true,
          time: res.last_upload_time,
        });
        // 刷新列表

        onSuccess();
      } else {
        setState({
          status: false,
        });
      }
    },
  });

  // 获取二维码
  const { data, run } = useRequest(getPhoneUploadQRcodeV2, {
    manual: true,
    onSuccess: res => {
      setState({
        time: res.last_upload_time,
      });
      checkUploadStatus.run();
    },
    onError: err => {
      console.log(err);
    },
  });

  useEffect(() => {
    run(folderId);
    return () => {
      checkUploadStatus.cancel();
    };
  }, [submenu[1]]);

  return (
    <div className={styles.wapper}>
      <div className={styles.title}>微信“扫一扫”上传手机文件</div>
      <div className={styles.QRcode}>
        {data?.page_url && <QRCode value={data.page_url} />}
      </div>
    </div>
  );
};

export default function UploadQrcode({
  children,
  ...res
}: PropsWithChildren<props>) {
  const [visible, setVisible] = useState(false);
  const { checkLoginStatus } = useCheckLoginStatus();
  const { showBindPhoneModal } = useUserBindPhoneModal();
  // const [phoneBindingShow, setPhoneBindingShow] = useState(false);

  return (
    <>
      <Popover
        overlayClassName={styles.popover}
        visible={visible}
        placement="bottomRight"
        trigger="click"
        onVisibleChange={v => {
          // 检测登录状态
          if (checkLoginStatus()) {
            setVisible(false);
          } else {
            if (getUserInfo().bind_phone !== 1) {
              setVisible(false);
              showBindPhoneModal();
            } else {
              setVisible(v);
            }
          }
        }}
        content={<QRcode {...res} />}
        getPopupContainer={ele => ele.parentNode as HTMLElement}
      >
        {children}
      </Popover>
      {/* <PhoneBinding
        phoneBindingShow={phoneBindingShow}
        setPhoneBindingShow={setPhoneBindingShow}
        // loginCallback={loginCallback}
        loginCallback={() => { }}
      /> */}
    </>
  );
}
