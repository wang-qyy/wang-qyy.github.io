import React, { PropsWithChildren, ReactElement } from 'react';
import PubModalMessage from '@/components/PubModalMessage';
import './index.less';

interface PubModalWarningProps {
  icon: string | ReactElement;
  title: string | ReactElement;
  button: any;
  width?: number;
  description: string;
  onCancel: () => void;
  visible: boolean;
  className?: string;
}

export default function PubModalWarning({
  icon,
  title,
  button,
  width = 370,
  description,
  onCancel,
  visible,
  className = '',
}: PropsWithChildren<PubModalWarningProps>) {
  const header = <div className="PMW-icon">{icon}</div>;
  const main = (
    <div className="PMW-main">
      <div className="PMW-title">{title}</div>
      {description && <div className="PMW-description">{description}</div>}
    </div>
  );
  const footer = (
    <>
      <div className="PMW-button">{button}</div>
    </>
  );
  return (
    <PubModalMessage
      header={header}
      main={main}
      footer={footer}
      width={width}
      className={`pub-modal-warning ${className}`}
      visible={visible}
      onCancel={onCancel}
    />
  );
}
