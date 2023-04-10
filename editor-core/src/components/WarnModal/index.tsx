import React from 'react';
import { Modal } from 'antd';
import styles from './index.less';

export function WarnModal(props: {
  onOk?: () => void;
  onCancel?: () => void;
  title: string;
  content: string;
  button: string;
  width: number;
}) {
  const { onCancel, onOk, title, content, button, width } = props;
  return Modal.warning({
    okText: button,
    icon: null,
    className: 'warnModal',
    content: (
      <div className={styles.warnModalContent}>
        <div className={styles.warnModalContentTitle}>{title}</div>
        <div className={styles.warnModalContentContent}>{content}</div>
      </div>
    ),
    width,
    closable: true,
    centered: true,
    onCancel() {
      onCancel && onCancel();
    },
    onOk() {
      onOk && onOk();
    },
  });
}
