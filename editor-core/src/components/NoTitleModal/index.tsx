import React, { PropsWithChildren, CSSProperties, ReactNode } from 'react';
import { Modal, ModalProps } from 'antd';
import styles from './index.modules.less';

interface NoTitleModalProps extends ModalProps {
  className?: string;
}

const NoTitleModal = ({
  title,
  children,
  onCancel,
  className,
  ...res
}: PropsWithChildren<NoTitleModalProps>) => {
  return (
    <Modal
      title={title || null}
      destroyOnClose
      className={`${styles['no-title-modal']} ${className}`}
      maskClosable={false}
      onCancel={onCancel}
      getContainer={document.getElementById('xiudodo')}
      {...res}
    >
      {children}
    </Modal>
  );
};

export default NoTitleModal;
