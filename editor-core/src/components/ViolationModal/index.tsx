import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import styles from './index.less';

export function ViolationModal(props: {
  goHome?: () => void;
  onCancel?: () => void;
}) {
  const { onCancel, goHome } = props;
  return Modal.warning({
    okText: '',
    icon: null,
    className: 'violationModal',
    content: (
      <div className={styles.violationModalContent}>
        <div className={styles.violationModalContentTitle}>
          <ExclamationCircleFilled
            className={styles.violationModalContentIcon}
          />
          系统检测到您上传的{goHome ? '视频' : '图片'}
          可能涉及违规，现已自动删除!
        </div>
        <img
          className={styles.lianxikefuErweima}
          src="//js.xiudodo.com/xiudodo/image/qrcode/contact_service.png"
          alt=""
        />
        <div className={styles.violationModalContentFooter}>
          如有误判，请扫码联系人工客服恢复！
        </div>
        {goHome && (
          <div
            className={styles.violationModalContentFooterButton}
            onClick={goHome}
          >
            返回首页 重新上传
          </div>
        )}
      </div>
    ),
    closable: !goHome,
    centered: true,
    width: 559,
    onCancel() {
      onCancel && onCancel();
    },
  });
}
