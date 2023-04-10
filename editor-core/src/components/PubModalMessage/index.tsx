import React, { ReactElement } from 'react';
import NoTitleModal from '@/components/NoTitleModal';
import './index.less';

interface PubModalMessageProps {
  header: string | ReactElement;
  main: ReactElement;
  footer: string | ReactElement;
  width: number;
  onCancel: () => void;
  visible: boolean;
  className: string;
}
export default function PubModalMessage({
  header,
  main,
  footer,
  width = 370,
  onCancel,
  visible,
  className = '',
}: PubModalMessageProps) {
  return (
    <NoTitleModal
      visible={visible}
      onCancel={onCancel}
      footer={false}
      width={width}
      centered
      maskClosable={false}
    >
      <div className={`pub-modal-message ${className}`}>
        <div className="PMM-header">{header}</div>
        <div className="PMM-main">{main}</div>
        <div className="PMM-footer">{footer}</div>
      </div>
    </NoTitleModal>
  );
}
