import React, { useEffect, useState } from 'react';
import NoTitleModal from '@/components/NoTitleModal';
import { ExclamationOutlined } from '@ant-design/icons';
import {
  useCapacityToRemindModal,
  useDownloadTheTransfiniteModal,
  useRechargeModal,
} from '@/store/adapter/useGlobalStatus';

import { useUserInfo } from '@/store/adapter/useUserInfo';

import { downloadLimit, memoryLimitWebLog, ClickType } from '@/utils/webLog';

import styles from './index.less';

const CapacityToRemind = (props: any) => {
  const { type } = props;
  const capacityToRemindModal = useCapacityToRemindModal();
  const downloadTheTransfiniteModal = useDownloadTheTransfiniteModal();
  const { value: rechargeModalValue, open: openRechargeModal } =
    useRechargeModal();

  const { value: value2, close: close2 } = downloadTheTransfiniteModal;

  const { value, close } = capacityToRemindModal;

  const val = type === '作品' ? value2 : value;
  const bindClose = type === '作品' ? close2 : close;

  const closeModal = (click_type?: ClickType) => {
    if (click_type) {
      // 埋点
      memoryLimitWebLog({
        limit_type: type === '作品' ? 'download' : 'draft',
        click_type,
      });
    }

    window.open(
      type === '作品'
        ? `https://xiudodo.com/myspace/videos`
        : 'https://xiudodo.com/myspace/drafts',
      '_blank',
    );
    bindClose();
  };

  const openModal = () => {
    // 埋点
    memoryLimitWebLog({
      limit_type: type === '作品' ? 'download' : 'draft',
      click_type: 'openVip',
    });
    bindClose();
    if (!rechargeModalValue) {
      openRechargeModal();
    }
  };

  const userInfo = useUserInfo();

  useEffect(() => {
    if (val) {
      downloadLimit({
        vip_type: userInfo.vip_type,
        limited_type: type === '作品' ? 'dlMemory' : 'draftMemory',
      });
    }
  }, [val]);

  return (
    <NoTitleModal
      closable={false}
      title={null}
      style={{ top: '25%' }}
      visible={val}
      onCancel={bindClose}
      wrapClassName="capacityToRemindModal"
      width={475}
      zIndex={10111011}
      keyboard={false}
      footer={false}
      maskClosable={false}
    >
      <div className={styles.capacityToRemindWarp}>
        <div className={styles.capacityToRemindWarpTop}>
          <div className={styles.capacityToRemindWarpTopIcon}>
            <ExclamationOutlined />
          </div>
          {type}储存空间不足
        </div>
        <div className={styles.capacityToRemindWarpTopCont}>
          您当前账号{type}存储已达上限，请至
          <span onClick={() => closeModal()}>【工作台】</span>
          删除部分
          {type}
          或升级VIP 再进行编辑。
        </div>

        <div className={styles.capacityToRemindWarpTopFooter}>
          <div className={styles.button1} onClick={() => closeModal('toDel')}>
            删除{type}
          </div>
          <div className={styles.button2} onClick={openModal}>
            升级VIP
          </div>
        </div>
      </div>
    </NoTitleModal>
  );
};

export default CapacityToRemind;
