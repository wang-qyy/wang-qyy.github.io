import { useState, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import { execCompound } from '@/api/watermark';
import Preview from '@/pages/Preview/index';
import DownloadProgress from '@/pages/Download/DownloadProgress';
import RechargeModule from '@/pages/Download/RechargeModule';
import { useGetDownload } from '@/hooks/useDownload';
import { getUserInfo } from '@/api/user';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import { useUserInfo, useUserInfoSetter } from '@/store/adapter/useUserInfo';
import {
  useDownloadProgress,
  useLoginModal,
} from '@/store/adapter/useGlobalStatus';
import { getformater } from '@/utils/userSave';
import { observer } from '@hc/editor-core';
import NoTitleModal from '@/components/NoTitleModal';
import { ViolationModal } from '@/components/ViolationModal';
import { videoTool } from '@/utils/webLog';

import styles from './index.less';
import PhoneBinding from '../../GlobalMobal/PhoneBinding';

const XiudodoHeader = () => {
  const [preview, setPreview] = useState(false);
  const [num, setNum] = useState(0);
  const { pauseVideo } = useCanvasPlayHandler();
  const [phoneBindingShow, setPhoneBindingShow] = useState(false);
  const userInfo = useUserInfo();
  const [visible, setvisible] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const { open } = useDownloadProgress();
  const format = getformater({});
  const updateUserInfo = useUserInfoSetter();
  const { open: openLoginModal } = useLoginModal();

  const { run: downloadOpen } = useGetDownload('refresh', e => {
    setNum(e);
  });
  const bindQuit = () => {
    // window.close();
    window.open(`https://xiudodo.com/watermark/`, '_self');
    // window.history.back();
  };
  const fetchApplyExport = useRequest(execCompound, {
    manual: true,
    onSuccess: res => {
      if (!res) {
        openLoginModal();
      }

      switch (res.stat) {
        case -21:
          open(res?.data?.id);
          break;
        case -22:
          message.error('视频水印正在上传');
          break;
        case -23:
          message.error('视频水印上传失败');
          break;
        case -30:
          setIsModalVisible(true);
          break;
        case -31:
          videoTool();
          setvisible(true);
          break;
        case -32:
          ViolationModal({
            goHome: () => {
              window.open('https://xiudodo.com/watermark/');
            },
          });
          break;
        case -33:
          ViolationModal({});
          break;
        case 0:
          if (res?.msg === '参数错误') {
            message.error('请添加水印后下载');
          } else {
            message.error(res?.msg);
          }
          break;
        default:
          open(res?.data?.id);
      }
      // 当请求成功返回，再关闭弹窗
    },
  });

  const getInfo = useRequest(getUserInfo, {
    manual: true,
    onSuccess: res => {
      updateUserInfo(res);

      if (res.id > -1) {
      } else {
        openLoginModal();
      }
    },
    onError: res => {
      console.log(res);
    },
  });
  // 点击下载合成
  const startSynthesis = () => {
    if (userInfo?.bind_phone !== 1) {
      setPhoneBindingShow(true);
    } else {
      pauseVideo();
      fetchApplyExport.run(format);
    }
  };

  const loginCallback = () => {
    getInfo.run();
  };

  useEffect(() => {
    getInfo.run();
    downloadOpen();
  }, []);

  return (
    <>
      <div className={styles.headerWrap}>
        <div className={styles.left}>
          <a href="https://xiudodo.com/">
            <div className={styles.logo} />
          </a>
          <div className={styles.leftText}>测试版</div>
        </div>
        <div className={styles.right}>
          <div className={styles.button} onClick={bindQuit}>
            退出
          </div>
          <div className={styles.downloadButton} onClick={startSynthesis}>
            高清视频下载
          </div>
        </div>
      </div>
      <RechargeModule />
      <DownloadProgress type="watermark" />
      <Preview visible={preview} onCancel={() => setPreview(false)} />
      <PhoneBinding
        phoneBindingShow={phoneBindingShow}
        setPhoneBindingShow={setPhoneBindingShow}
        loginCallback={loginCallback}
      />
      <Modal
        visible={isModalVisible}
        footer={false}
        bodyStyle={{ padding: '0px' }}
        width={608}
        closable={false}
        getContainer={document.getElementById('xiudodo')}
      >
        <div className={styles.headerModal}>
          <div className={styles.headerModalTitle}>当前服务区拥堵…</div>
          <div className={styles.headerModalText}>请稍后再来下载～</div>
          <div
            className={styles.headerModalButton}
            onClick={() => {
              setIsModalVisible(false);
            }}
          >
            知道了
          </div>
        </div>
      </Modal>
      <NoTitleModal
        visible={visible}
        width={354}
        onCancel={() => {
          setvisible(false);
        }}
        footer={null}
      >
        <div className={styles.compressModalWarp}>
          <div className={styles.modalTxt}>该功能仅限VIP用户使用</div>
          <div className={styles.modalTxt1}>
            开通视频水印VIP 功能无限畅用 不限下载次数
          </div>
          <div
            className={styles.modalButton}
            onClick={() => {
              setvisible(false);
              window.open('https://xiudodo.com/vip/paying.html?type=watermark');
            }}
          >
            立即开通
          </div>
        </div>
      </NoTitleModal>
    </>
  );
};

export default observer(XiudodoHeader);
