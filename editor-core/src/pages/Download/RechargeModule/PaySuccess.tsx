import React from 'react';
import { Button } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import { usePaySuccessModal } from '@/store/adapter/useGlobalStatus';
import NoTitleModal from '@/components/NoTitleModal';
import PubModalContent from '@/components/PubModalContent';
import PubModalQQPanel from '@/components/PubModalQQPanel';

import styles from './index.module.less';

function PaySuccess() {
  const paySuccessModal = usePaySuccessModal();

  const handleClose = () => {
    paySuccessModal.close();
    // window.open('/my/download', '_self');
    window.location.reload();
  };

  return (
    <NoTitleModal
      visible={Boolean(paySuccessModal.value)}
      onCancel={handleClose}
      footer={false}
      width={554}
      centered
      zIndex={99999999999}
    >
      <PubModalContent
        className={styles['pay-success']}
        topNode={
          <div className={styles['pay-successs-title']}>
            <XiuIcon type="icondui" className={styles.anticon} />
            <p>充值成功</p>
            <Button
              type="primary"
              onClick={handleClose}
              className={styles['ant-btn']}
            >
              确定
            </Button>
          </div>
        }
        bottomNode={<PubModalQQPanel />}
      />
    </NoTitleModal>
  );
}

export default PaySuccess;
